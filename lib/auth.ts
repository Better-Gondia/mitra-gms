import GoogleProvider from "next-auth/providers/google";
import prisma from "@/prisma/db";
import { NextAuthOptions, Session, User, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "@prisma/client/index.js";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { generateUniqueUserSlug } from "@/app/actions/slug";

export interface appSession extends Session {
  status: "loading" | "authenticated" | "unauthenticated";
  data: {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      role?: Role;
    };
  };
}

export interface ExtendedSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: Role;
    profilePic?: string | null;
  };
}

interface Token {
  id?: string;
  name?: string | null;
  email: string;
  role?: Role;
  profilePic?: string | undefined | null;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || "secr3t",

  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    updateAge: 24 * 60 * 60, // Refresh token every 24 hours if user is active
  },

  jwt: {
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    session: async ({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<ExtendedSession> => {
      const newSession: ExtendedSession = session as ExtendedSession;
      if (newSession.user && token) {
        newSession.user.id = (token as any).id ?? "";
        newSession.user.name = (token as any).name ?? "";
        newSession.user.email = (token as any).email ?? "";
        newSession.user.role = (token as any).role;
        newSession.user.profilePic = (token as any).profilePic ?? undefined;
      }
      return newSession;
    },

    jwt: async ({ token, user }: { token: JWT; user?: User | any }) => {
      if (user) {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: user.email ?? "",
          },
        });
        if (dbUser) {
          (token as any).id = dbUser.id.toString();
          (token as any).name = dbUser.name;
          (token as any).email = dbUser.email ?? "";
          (token as any).role = dbUser.role;
        }
      }
      return token;
    },

    signIn: async ({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) => {
      try {
        if (account?.provider === "google") {
          const email = user.email;
          if (!email) return false;

          const userDb = await prisma.user.findFirst({
            where: {
              email: email,
              authType: "GOOGLE",
            },
          });

          if (userDb) return true;

          const cookieStore = await cookies();

          const slug = await generateUniqueUserSlug();

          await prisma.user.create({
            data: {
              email: email,
              name: profile?.name ?? "Unknown",
              slug,
              mobile: uuid(),
              address: "",
              age: 0,
              gender: "Other",
              authType: "GOOGLE",
            },
          });

          return true;
        }
      } catch (error) {
        console.error("Error in signIn callback", error);
      }
      return false;
    },
  },
} satisfies NextAuthOptions;

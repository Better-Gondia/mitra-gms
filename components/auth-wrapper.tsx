"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignIn from "@/app/auth/signin/page";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // User is not authenticated, stay on sign-in page
      return;
    }

    // User is authenticated, they can access the app
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return <>{children}</>;
}

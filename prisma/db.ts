import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () =>
  new PrismaClient({
    // log: [
    //   {
    //     emit: "stdout",
    //     level: "query",
    //   },
    //   {
    //     emit: "stdout",
    //     level: "error",
    //   },
    //   {
    //     emit: "stdout",
    //     level: "info",
    //   },
    //   {
    //     emit: "stdout",
    //     level: "warn",
    //   },
    // ],
  });

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

import { PrismaClient } from "./generated/client";

// ------------------------------
// PRISMA SINGLETON
// ------------------------------
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Removed "query" logging (too noisy)
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// --------------------------------
// PRIMARY DB CLIENT EXPORT
// --------------------------------
export const db = prisma;

// ------------------------------
// RE-EXPORT ALL PRISMA TYPES
// ------------------------------
export * from "./generated/client";

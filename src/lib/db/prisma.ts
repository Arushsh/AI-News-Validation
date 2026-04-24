import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getPrisma = () => {
  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
    }
    return globalForPrisma.prisma;
  } catch (e) {
    console.error("Prisma initialization failed:", e);
    return null;
  }
};

// Export the singleton instance
export const prisma = getPrisma() as PrismaClient;

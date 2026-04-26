import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getPrisma = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn("DATABASE_URL is not defined. Prisma might fail to connect.");
    }

    globalForPrisma.prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
    
    return globalForPrisma.prisma;
  } catch (e) {
    console.error("Prisma initialization failed:", e);
    return null;
  }
};

// Export the singleton instance
export const prisma = getPrisma() as PrismaClient;

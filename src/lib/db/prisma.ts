import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getPrisma = () => {
  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['error'],
      });
    }
    return globalForPrisma.prisma;
  } catch (e) {
    console.error("Prisma initialization failed:", e);
    return null;
  }
};

// Export only the getter
// export const prisma = getPrisma(); // Disabled module-level init

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.verificationReport.count();
    console.log('--- DATABASE STATUS ---');
    console.log('Total Verification Reports:', count);
    
    if (count > 0) {
      const latest = await prisma.verificationReport.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log('Latest Report Topic:', latest.title);
      console.log('Latest Report Score:', latest.authenticityScore);
    }
  } catch (e) {
    console.error('Check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();

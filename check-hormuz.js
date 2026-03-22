const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { title: { contains: 'Hormuz' } },
      take: 5
    });
    console.log('Hormuz Matches:', JSON.stringify(articles, null, 2));
    
    // Also check for '2026'
    const y2026 = await prisma.newsArticle.findMany({
      where: { title: { contains: '2026' } },
      take: 5
    });
    console.log('2026 Matches:', JSON.stringify(y2026, null, 2));
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();

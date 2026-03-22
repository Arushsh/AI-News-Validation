const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { title: true, imageUrl: true, sourceName: true, createdAt: true }
    });
    console.log('Database Sample:', JSON.stringify(articles, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();

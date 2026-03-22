const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INITIAL_SOURCES = [
  { name: 'Reuters', domain: 'reuters.com', credibility: 96, category: 'Global News' },
  { name: 'BBC News', domain: 'bbc.com', credibility: 94, category: 'Global News' },
  { name: 'Associated Press', domain: 'apnews.com', credibility: 97, category: 'Global News' },
  { name: 'The Guardian', domain: 'theguardian.com', credibility: 88, category: 'Opinion+News' },
  { name: 'New York Times', domain: 'nytimes.com', credibility: 85, category: 'US News' },
  { name: 'Fox News', domain: 'foxnews.com', credibility: 58, category: 'US News' },
  { name: 'RT (Russia Today)', domain: 'rt.com', credibility: 22, category: 'State Media' },
  { name: 'InfoWars', domain: 'infowars.com', credibility: 4, category: 'Conspiracy' },
  { name: 'Snopes', domain: 'snopes.com', credibility: 91, category: 'Fact Check' },
  { name: 'PolitiFact', domain: 'politifact.com', credibility: 90, category: 'Fact Check' },
  { name: 'ESPNCricinfo', domain: 'espncricinfo.com', credibility: 93, category: 'Sports' },
  { name: 'TechCrunch', domain: 'techcrunch.com', credibility: 79, category: 'Technology' },
  { name: 'Hindustan Times', domain: 'hindustantimes.com', credibility: 82, category: 'Indian News' },
  { name: 'Times of India', domain: 'timesofindia.indiatimes.com', credibility: 80, category: 'Indian News' },
  { name: 'Global News', domain: 'globalnews.ca', credibility: 88, category: 'International' },
];

async function seed() {
  console.log('--- SEEDING SOURCES ---');
  for (const s of INITIAL_SOURCES) {
    await prisma.source.upsert({
      where: { domain: s.domain },
      update: s,
      create: s
    });
    console.log(`Synced: ${s.name}`);
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());

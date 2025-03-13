const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await hash('test123', 12);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      name: 'Test User'
    },
  });

  // Seed curated sh*tchat content
  const curatedContent = [
    {
      content: "Did you know? The average person spends about 3 years of their life on the toilet!",
      type: "fact",
      source: "curated",
      isCurated: true
    },
    {
      content: "Why did the toilet paper roll down the hill? To get to the bottom!",
      type: "joke",
      source: "curated",
      isCurated: true
    },
    {
      content: "The first flush toilet was invented in 1596 by Sir John Harington.",
      type: "fact",
      source: "curated",
      isCurated: true
    },
    {
      content: "What did the toilet say to the plunger? 'You're really pushing my buttons!'",
      type: "joke",
      source: "curated",
      isCurated: true
    },
    {
      content: "The world's most expensive toilet is made of solid gold and costs over $1 million!",
      type: "fact",
      source: "curated",
      isCurated: true
    }
  ];

  for (const content of curatedContent) {
    await prisma.ShitChat.create({
      data: content
    });
  }

  // Initialize API usage tracking
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.ApiUsage.create({
    data: {
      date: today,
      count: 0
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
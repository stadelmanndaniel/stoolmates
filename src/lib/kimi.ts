import { PrismaClient } from '@prisma/client';

const KIMI_API_URL = 'https://api.kimi.ai/v1/chat/completions';

const contentTypes = {
  fact: "Generate a fun, interesting fact about bathrooms or toilets. Keep it light and entertaining.",
  joke: "Create a family-friendly bathroom-related joke.",
  news: "Generate a fictional but plausible news headline about bathroom innovation.",
  history: "Share an interesting historical fact about bathrooms or toilets."
};

const messages = [
  {
    content: "Did you know? The average person spends about 3 years of their life on the toilet!",
    type: "fact",
    source: "curated"
  },
  {
    content: "Why did the toilet paper roll down the hill? To get to the bottom!",
    type: "joke",
    source: "curated"
  },
  {
    content: "The first flush toilet was invented in 1596 by Sir John Harington.",
    type: "history",
    source: "curated"
  },
  {
    content: "What did the toilet say to the plunger? 'You're really pushing my buttons!'",
    type: "joke",
    source: "curated"
  },
  {
    content: "The world's most expensive toilet is made of solid gold and costs over $1 million!",
    type: "fact",
    source: "curated"
  }
];

export async function generateContent() {
  try {
    // Get a random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  } catch (error) {
    console.error('Error in generateContent:', error);
    return {
      content: "Failed to fetch a message. Please try again.",
      type: "error",
      source: "fallback"
    };
  }
}

async function getRandomCuratedContent() {
  const prisma = new PrismaClient();
  
  try {
    // Get all curated messages ordered by lastUsedAt (nulls first)
    const messages = await prisma.shitChat.findMany({
      where: {
        isCurated: true
      },
      orderBy: [
        { lastUsedAt: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    if (messages.length === 0) {
      return null;
    }

    // Get the least recently used message
    const selectedMessage = messages[0];

    // Update the lastUsedAt timestamp for this message
    await prisma.shitChat.update({
      where: { id: selectedMessage.id },
      data: { lastUsedAt: new Date() }
    });

    return selectedMessage;
  } catch (error) {
    console.error('Error fetching curated content:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
} 
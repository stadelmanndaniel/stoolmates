import { KIMI_API_KEY } from './env';

export interface ShitChatContent {
  content: string;
  type: string;
  source: string;
}

export async function getShitChatContent(): Promise<ShitChatContent> {
  try {
    const response = await fetch('https://api.kimi.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a fun and engaging AI that provides interesting facts and jokes about bathroom activities. Keep it light-hearted and appropriate.',
          },
          {
            role: 'user',
            content: 'Give me a fun fact or joke about bathroom activities.',
          },
        ],
        model: 'moonshot-v1-8k',
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shit chat content');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      type: 'text',
      source: 'kimi',
    };
  } catch (error) {
    console.error('Error fetching shit chat content:', error);
    return {
      content: 'Why did the toilet paper roll down the hill? To get to the bottom!',
      type: 'text',
      source: 'fallback',
    };
  }
} 
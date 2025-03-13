import { KIMI_API_KEY } from '@/lib/env';

export async function getShitChatContent() {
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
            content: 'You are a fun and engaging AI that provides interesting facts and jokes about bathroom activities. Keep the content light-hearted and appropriate.',
          },
          {
            role: 'user',
            content: 'Generate a fun fact or joke about bathroom activities.',
          },
        ],
        model: 'moonshot-v1-8k',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      type: 'fact',
      source: 'kimi',
    };
  } catch (error) {
    return {
      content: "Taking a break? Here's a fun fact: The average person spends about 3 years of their life on the toilet!",
      type: 'fact',
      source: 'fallback',
    };
  }
} 
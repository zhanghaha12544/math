import { NextRequest, NextResponse } from 'next/server';
import { ProxyAgent } from 'undici';

// 重试函数
async function fetchWithRetry(url: string, options: any, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`尝试 ${i + 1}/${maxRetries} 失败:`, error);
      if (i === maxRetries - 1) throw error;
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('所有重试都失败了');
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('收到消息:', message);
    console.log('DeepSeek Key:', process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置');

    // 代理（可选）
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;
    if (proxyUrl) {
      console.log('[Gemini] Using proxy:', proxyUrl);
    } else {
      console.log('[Gemini] No proxy env found');
    }
    const agent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

    // 调用 DeepSeek (OpenAI 兼容接口)
    const deepseekResponse = await fetchWithRetry(
      'https://api.deepseek.com/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的考研数学AI助手，请用中文解答，并详细展示推导过程。涉及数学时输出符合 KaTeX 的 LaTeX 语法。'
            },
            {
              role: 'user',
              content: message,
            }
          ],
          temperature: 0.7,
          top_p: 0.95,
          stream: false,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(30000),
        // @ts-ignore
        dispatcher: agent,
      },
      3
    );

    if (!deepseekResponse.ok) {
      let errText = '';
      try {
        errText = await deepseekResponse.text();
      } catch {}
      console.error('[DeepSeek] HTTP', deepseekResponse.status, errText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${errText}`);
    }

    const deepseekData = await deepseekResponse.json();
    if (!deepseekData.choices || !deepseekData.choices[0] || !deepseekData.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    const responseText = deepseekData.choices[0].message.content;

    return NextResponse.json({
      response: responseText,
      usage: null
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // 如果是网络连接问题，返回一个模拟回复
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
      const mockResponses = [
        '抱歉，目前网络连接有问题，无法连接到AI服务器。这是一个模拟回复。',
        '由于网络问题，暂时无法获取AI回复。请检查网络连接后重试。',
        'AI服务暂时不可用。这可能是由于网络连接问题或服务器维护。'
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({
        response: randomResponse,
        usage: null,
        mock: true
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from AI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

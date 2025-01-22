import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { messages } = req.body;

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: true
            })
        });

        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('API 请求失败:', response.status, response.statusText, errorResponse);
            throw new Error(`API 请求失败: ${response.statusText}`);
        }

        // 设置响应头为流式传输
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 使用可读流读取数据
        for await (const chunk of response.body) {
            const decodedChunk = chunk.toString(); // 将 Buffer 转换为字符串
            console.log('后端收到的流式数据:', decodedChunk); // 打印流式数据
            res.write(decodedChunk);
            res.flush();
        }

        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '服务器错误，请稍后再试' });
    }
}

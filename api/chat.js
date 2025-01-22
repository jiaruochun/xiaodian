import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { messages } = req.body;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // 从环境变量中读取 API 密钥
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: false // 如果需要流式传输，可以改为 true
            })
        });

        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '服务器错误，请稍后再试' });
    }
}

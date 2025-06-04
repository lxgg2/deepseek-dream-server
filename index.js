const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const API_KEY = process.env.API_KEY;

app.post('/dream-interpret', async (req, res) => {
  const { userInput } = req.body;

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位温和的心理咨询师，擅长解释梦境。请用简洁、温暖的语言解释梦的含义，直接开始分析，不要说你在思考，也不要暴露身份。'
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ reply: '抱歉，解释失败，请稍后再试。' });
  }
});

app.get('/', (req, res) => {
  res.send('AI释梦服务运行中...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

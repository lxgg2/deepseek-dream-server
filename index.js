const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

const API_KEY = process.env.API_KEY;

app.use(bodyParser.json());

app.post('/dream-interpret', async (req, res) => {
  const { userInput, mode, followUpQuestions = [], followUpAnswers = '' } = req.body;

  try {
    let messages = [];

    if (mode === 'followup') {
      // 步骤 1：只生成两个追问的问题
      messages = [
        {
          role: 'system',
          content: '你是一位温暖的心理咨询师。用户会告诉你一段梦境，请你提出两个温柔、具体、有启发性的追问问题，用于深入理解梦的内容，不需要给出解释。'
        },
        {
          role: 'user',
          content: userInput
        }
      ];

      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const replyText = response.data.choices[0].message.content;

      // 默认以换行符或编号分割问题
      const questions = replyText.split(/[\n\d]+\.\s?/).filter(q => q.trim() !== '');

      res.json({ questions });

    } else if (mode === 'final') {
      // 步骤 2：生成最终梦境解析
      messages = [
        {
          role: 'system',
          content: '你是一位经验丰富的心理咨询师，擅长对梦境进行温柔、细致、鼓励性的解读，避免用生硬的语言。'
        },
        {
          role: 'user',
          content: `这是用户的梦境：${userInput}`
        },
        {
          role: 'user',
          content: `这是我对你的两个追问的回答：${followUpAnswers}`
        }
      ];

      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 700
      }, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const reply = response.data.choices[0].message.content;
      res.json({ reply });

    } else {
      res.status(400).json({ error: 'Invalid mode 参数，必须是 followup 或 final' });
    }

  } catch (err) {
    console.error('AI 请求失败:', err.message);
    res.status(500).json({ reply: '抱歉，AI解释失败，请稍后再试。' });
  }
});

app.get('/', (req, res) => {
  res.send('AI释梦服务运行中...');
});

app.listen(10000, () => {
  console.log('Server running on port 10000');
});

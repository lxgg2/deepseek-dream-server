const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

const API_KEY = process.env.API_KEY;

app.use(bodyParser.json());

app.post('/dream-interpret', async (req, res) => {
  const { userInput, followUpQuestions, followUpAnswers, mode } = req.body;

  try {
    let prompt = '';
    if (mode === 'followup') {
      // 生成两个补充性问题
      prompt = `请根据这段梦境内容提出两个更深入的问题，引导用户补充细节。\n梦境内容如下：\n"${userInput}"\n\n请以换行分隔输出两个问题。`;
    } else if (mode === 'final') {
      // 用户已回答问题，生成最终解释
      prompt = `以下是用户描述的梦境与对AI提出问题的补充回答，请你结合上下文进行梦境解析，用温和简洁的语言回复：\n` +
        `梦境内容：${userInput}\n` +
        `AI提出的问题：${followUpQuestions?.join('；')}\n` +
        `用户的回答：${followUpAnswers}\n` +
        `请用一段简洁优美的语言进行梦境解释，不超过150字。`;
    } else {
      return res.status(400).json({ error: '缺少或不支持的 mode 参数' });
    }

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是专业的释梦专家，请用温和简洁的话语分析梦境含义。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content.trim();

    if (mode === 'followup') {
      const questions = result.split('\n').map(q => q.trim()).filter(q => q);
      return res.json({ questions: questions.slice(0, 2) });
    } else {
      return res.json({ reply: result });
    }

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ reply: '抱歉，AI服务暂时无法响应，请稍后再试。' });
  }
});

app.get('/', (req, res) => {
  res.send('AI释梦服务运行中...');
});

app.listen(10000, () => {
  console.log('Server running on port 10000');
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let state = {
  me: 0,
  friend: 0,
};

// Обработка отправки клика
app.post('/send', (req, res) => {
  const { from } = req.body;
  if (from === 'me') {
    state.me++;
  } else if (from === 'friend') {
    state.friend++;
  }
  res.json({ success: true, state });
});

// Отдаём текущее состояние
app.get('/state', (req, res) => {
  res.json(state);
});

// Обнулить счётчики (необязательно, удобно для отладки)
app.post('/reset', (req, res) => {
  state = { me: 0, friend: 0 };
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const statePath = path.join(__dirname, 'state.json');

// Загружаем состояние из файла
function loadState() {
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (e) {
      console.error("❌ Ошибка чтения state.json. Используется начальное состояние.");
    }
  }
  return { me: 0, friend: 0 };
}

// Сохраняем состояние в файл
function saveState(data) {
  try {
    fs.writeFileSync(statePath, JSON.stringify(data), 'utf-8');
  } catch (e) {
    console.error("❌ Не удалось сохранить состояние:", e);
  }
}

let state = loadState();

// 👉 POST /send — увеличить счётчик
app.post('/send', (req, res) => {
  const { from } = req.body;

  if (from === 'me') {
    state.me++;
  } else if (from === 'friend') {
    state.friend++;
  } else {
    return res.status(400).json({ error: 'invalid "from" value' });
  }

  saveState(state);
  res.json({ success: true, state });
});

// 👉 GET /state — получить текущие значения
app.get('/state', (req, res) => {
  res.json(state);
});

// 👉 POST /reset — обнулить
app.post('/reset', (req, res) => {
  state = { me: 0, friend: 0 };
  saveState(state);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

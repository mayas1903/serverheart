const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Управление состоянием на сервере ---
// Это объект будет хранить все данные "комнаты"
let state = {
  scores: {
    userA: 0,
    userB: 0,
  },
  users: {
    userA: null, // ID для первого пользователя
    userB: null, // ID для второго пользователя
  },
  // Мы будем хранить последние несколько событий
  history: []
};

// --- API эндпоинты ---

// Эндпоинт для "входа" нового пользователя
app.get('/join', (req, res) => {
  // Создаем временный ID для сессии пользователя
  const tempId = Date.now().toString() + Math.random().toString(); 

  // Если место первого игрока свободно
  if (state.users.userA === null) {
    state.users.userA = tempId;
    console.log('User A joined');
    return res.json({ role: 'userA', state });
  }

  // Если место второго игрока свободно
  if (state.users.userB === null) {
    state.users.userB = tempId;
    console.log('User B joined');
    return res.json({ role: 'userB', state });
  }
  
  // Если оба места заняты, пользователь будет зрителем
  return res.json({ role: 'spectator', state });
});


// Эндпоинт для получения текущего состояния
app.get('/state', (req, res) => {
  res.json(state);
});

// Эндпоинт для отправки "любви"
app.post('/send-love', (req, res) => {
  const { role } = req.body; // Ожидаем в теле запроса: { "role": "userA" } или { "role": "userB" }

  let actorName = '';

  if (role === 'userA') {
    state.scores.userA += 1;
    actorName = 'Pumpkin'; // Предположим, что userA это Pumpkin
  } else if (role === 'userB') {
    state.scores.userB += 1;
    actorName = 'Me'; // А userB это "Я"
  } else {
    return res.status(400).json({ success: false, message: 'Invalid role provided.' });
  }
  
  // Добавляем событие в историю
  const now = new Date();
  const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  state.history.unshift({ actor: actorName, time: timeString });
  
  // Ограничиваем историю до 10 последних событий
  if (state.history.length > 10) {
    state.history.pop();
  }

  console.log('New state:', state.scores);
  res.json({ success: true, state });
});

// Эндпоинт для сброса состояния (удобно для тестирования)
app.post('/reset', (req, res) => {
    state = {
      scores: { userA: 0, userB: 0 },
      users: { userA: null, userB: null },
      history: []
    };
    console.log('State has been reset.');
    res.json({ success: true, message: 'State reset.' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

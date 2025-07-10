// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

// — Поддержка CORS и парсинг JSON (если вдруг понадобятся HTTP-роуты) —
app.use(cors());
app.use(express.json());

// — Отдача статических файлов (гифки, svg, avatar-placeholder и т.д.) —
app.use(express.static(path.join(__dirname, 'public')));

// — Создаём HTTP-сервер и «на его базе» WebSocket —
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// — Глобальное состояние «комнаты» —
let state = {
  scores: { userA: 0, userB: 0 },
  users: { userA: null, userB: null },
  history: []  // { actor: 'Pumpkin'|'Me', time: 'HH:MM' }
};

// — Утилита для рассылки всем клиентам —
function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

wss.on('connection', ws => {
  // При подключении сразу пришлём текущее состояние
  ws.send(JSON.stringify({ type: 'update', payload: state }));

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); }
    catch (e) { return; }

    switch (msg.type) {
      case 'join': {
        // Клиент просит роль
        const tempId = Date.now().toString() + Math.random().toString();
        let role;
        if (!state.users.userA) {
          state.users.userA = tempId;
          role = 'userA';
        } else if (!state.users.userB) {
          state.users.userB = tempId;
          role = 'userB';
        } else {
          role = 'spectator';
        }
        // Отдаём роль и текущее состояние
        ws.send(JSON.stringify({ type: 'join', role, state }));
        break;
      }

      case 'click': {
        // msg: { type:'click', role:'userA'|'userB' }
        if (msg.role === 'userA') {
          state.scores.userA++;
        } else if (msg.role === 'userB') {
          state.scores.userB++;
        } else {
          return;
        }
        // Добавляем в историю
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        const actorName = msg.role === 'userA' ? 'Pumpkin' : 'Me';
        state.history.unshift({ actor: actorName, time: `${hh}:${mm}` });
        if (state.history.length > 10) state.history.pop();

        // Рассылаем всем обновлённый state
        broadcast({ type: 'update', payload: state });
        break;
      }

      case 'reset': {
        // Сброс состояния
        state = {
          scores: { userA: 0, userB: 0 },
          users: { userA: null, userB: null },
          history: []
        };
        // Сообщаем клиентам, что сброс выполнен
        broadcast({ type: 'resetDone' });
        break;
      }
    }
  });
});

// Запуск
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

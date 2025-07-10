const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let loveCount = {
  fromMe: 97,
  fromPartner: 511,
};

app.get('/counter', (req, res) => {
  res.json(loveCount);
});

app.post('/send-love', (req, res) => {
  loveCount.fromMe += 1;
  res.json({ success: true, fromMe: loveCount.fromMe });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
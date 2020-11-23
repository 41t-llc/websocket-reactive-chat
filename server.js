const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = '/views/index.html';

const server = express()
  .use("/public", express.static(path.join(__dirname, '/public')))
  .use((req, res) => res.sendFile(INDEX, {root: __dirname}))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// WebSocket
const {Server} = require('ws');
const wss = new Server({server});

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', message => {
    wss.clients.forEach(client => {
      client.send(message);
    });
  });
  ws.on('close', () => console.log('Client disconnected'));
});

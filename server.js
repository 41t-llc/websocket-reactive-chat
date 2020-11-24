const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = '/views/index.html';

const server = express()
  .use("/public", express.static(path.join(__dirname, '/public')))
  .use((req, res) => res.sendFile(INDEX, {root: __dirname}))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// WebSocket
const { Server } = require('ws');
const wss = new Server({server});

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    let req = JSON.parse(message);

    console.log(req);

    switch (req.type) {

      case 'msg':
        if (req.text.trim() != "" &&
            req.user.name != "") {
          wss.clients.forEach(client => {
            client.send(message);
          });
        }
        break;

      case 'signin':
        if (req.login != "" &&
            req.password != "") {
          client.query(`
              SELECT *
              FROM users
              WHERE login = '${req.login}'
              AND password = '${req.password}'`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  if (result.rowCount) {
                    let res = {
                      type: 'signin',
                      user: {
                        name: result.rows[0].username
                      }
                    };
                    ws.send(JSON.stringify(res));
                  }
                }
              }
          );
        }
        break;

      case 'signup':
        if (req.username != "" &&
            req.login != "" &&
            req.password != "") {
          client.query(`
              INSERT INTO users(username, login, password)
              VALUES ('${req.username}', '${req.login}', '${req.password}')`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  if (result.rowCount) {
                    let res = {
                      type: 'signup',
                      user: {
                        name: req.username
                      }
                    };
                    ws.send(JSON.stringify(res));
                  }
                }
              }
          );
        }
        break;

      default:
        // Что-то

    }
  });
  ws.on('close', () => console.log('Client disconnected'));
});

// PostgreSQL
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL, // || "postgres://user:password@localhost:5432/websocketapp"
  ssl: { rejectUnauthorized: false }
});

client.connect();

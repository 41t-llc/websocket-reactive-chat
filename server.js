const express = require('express');
const path = require('path');

const bcrypt = require('bcrypt');
const saltRounds = 12;
const PORT = process.env.PORT || 3000;
const INDEX = '/views/index.html';
let fs = require('fs'), obj;
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

    switch (req.type) {

      case 'msg':
        if (req.text.trim() !== "" &&
            req.user.name !== "") {

              client.query(`SELECT id FROM users WHERE username = '${req.user.name}'`, (err, result) => {
                  if (err) throw err;
                  if (result.rowCount) {
                      let date = new Date(),
                          curdate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.toLocaleTimeString();
                      client.query(`INSERT INTO messages("user",chat,date,text) VALUES (${result.rows[0].id},1,'${curdate}','${req.text.replace('/\w/g',(match) => ("\\" + match))}')`,
                          (err, result) => {
                          if (err) throw err;
                      });
                      let res = {
                          type: 'msg',
                          text: req.text,
                          user : req.user,
                          date: new Date(),
                      }
                      res = JSON.stringify(res)
                      wss.clients.forEach(client => {
                          client.send(res);

                      });
                  }
              });


               }
        break;

      case 'signin':
        if (req.login !== "" &&
            req.password !== "") {
            req.login = req.login.replace('/\w/g',(match) => ("\\" + match));
            req.password = req.password.replace('/\w/g',(match) => ("\\" + match));

          client.query(`
              SELECT *
              FROM users
              WHERE login = '${req.login}'`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  if (result.rowCount) {
                    bcrypt.compare(req.password,result.rows[0].password,(err, answer) => {
                        if (err) throw err;
                        if(answer) {
                          let res = {
                            type: 'signin',
                            user: {
                              name: result.rows[0].username
                            }
                          };
                          ws.send(JSON.stringify(res));
                            client.query(`SELECT date,text,username as user FROM messages m inner join users u on m.user = u.id order by m.id`, (err, result) => {
                                if(err) throw err;
                                if(result.rowCount) {

                                    result.rows.map((message) =>  message.user = { name: message.user})
                                    let res = {
                                        type: "allmsg",
                                        messages: result.rows
                                    }
                                    ws.send(JSON.stringify(res));
                                }
                            });
                        }
                    })

                }} })


        }
        break;

      case 'signup':
        if (req.username !== "" &&
            req.login !== "" &&
            req.password !== "") {
            req.username = req.username.replace('/\w/g',(match) => ("\\" + match));
            req.login = req.login.replace('/\w/g',(match) => ("\\" + match));
            req.password = req.password.replace('/\w/g',(match) => ("\\" + match));
          bcrypt.hash(req.password, saltRounds,(err,hash) => {
            if(err) throw err;
            client.query(`
              INSERT INTO users(username, login, password)
              VALUES ('${req.username}', '${req.login}', '${hash}')`,
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
          })

        }
        break;

      default:
        // Что-то

    }
  });
  ws.on('close', () => console.log('Client disconnected'));
});

// PostgreSQL
// #TODO Перед коммитом не забывайте включить ssl
const { Client } = require('pg');
const client = new Client({

  connectionString:  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/websocketapp"
 // ssl: { rejectUnauthorized: false }
});

client.connect();



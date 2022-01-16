const express = require('express');
const path = require('path');

const bcrypt = require('bcrypt');
const saltRounds = 12;
const PORT = process.env.PORT || 3000;
const nodeMailer = require('nodemailer');
const INDEX = '/views/index.html';
const server = express()
  .use("/public", express.static(path.join(__dirname, '/public')))
  .use((req, res) => res.sendFile(INDEX, {root: __dirname}))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// WebSocket
const { Server } = require('ws');
const wss = new Server({server});
// Transporter
let testAccount =  nodeMailer.createTestAccount();
const transporter = nodeMailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "62e844d75fb7d5",
        pass: "bfce2bf 37f5712"
    }
});
let clients = [],
    clientsUserNames = [],
    UsersForVerify = [];

wss.on('connection', ws => {
    let id;
  console.log('Client connected');
    ws.try = 0;
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
                      clients.forEach(client => {
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
                          id = result.rows[0].id;
                          clients[result.rows[0].id] = ws;
                          clientsUserNames[id] = result.rows[0].username;
                          client.query(`SELECT date,text,username as user FROM messages m inner join users u on m.user = u.id order by m.id`, (err, result) => {
                              if(err) throw err;
                                if(result.rowCount) {
                                    result.rows.map((message) =>  message.user = { name: message.user})
                                    let res = {
                                        type: "allmsg",
                                        messages: result.rows
                                    }
                                    ws.send(JSON.stringify(res));
                                    ws.try = "Sign in";
                                    SendUsers();
                                }
                            });
                        }
                        else {
                           SendError("error","Data is incorrected");
                        }
                    })

                }
                else {
                      SendError("error","Data is incorrected");
                  }
                } })


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
            let user = {
                data : {
                    username: req.username,
                    login: req.login,
                    password: hash
                },
                verifyToken : GenerateToken()
            }
              UsersForVerify[user.verifyToken] = user;
            transporter.sendMail({
                to: req.email,
                subject: "GPT VERIFY",
                html: `<a href='${user.verifyToken}'`
            })
          })

        }
        break;

      case "Check":
          if(ws.try !== "Sign in") {
              if (ws.try === 5) {
                  let data = {
                      type: 'close'
                  }
                  ws.send(JSON.stringify(data));
                  delete ws;
              }
              console.log("Count of tryies " + ws.try);
              ws.try += 1;
          }
          break;
      default:
          ws.send("Чел, а ты хорош");
        // Что-то

    }
  });
  ws.on('close', () => {
      console.log('Client disconnected' + id)
      if(id) {
          delete clients[id];
          delete clientsUserNames[id];
          SendUsers();
      }
  });


});
//Queries

// PostgreSQL
// #TODO Перед коммитом не забывайте включить ssl
const { Client } = require('pg');
const client = new Client({

  connectionString:  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/websocketapp",
 // ssl: { rejectUnauthorized: false}
});

client.connect();


function SendError(type, message) {
    let res = {
        type: type,
        error: message
    };
    ws.send(JSON.stringify(res));
}
function SendUsers() {
    let res = {
        type: "activityUsers",
        activityUsers: clientsUserNames.filter(x => x)
    }
    clients.forEach(client => {
        client.send(JSON.stringify(res));
    });
}
function VerifingUser (token) {
    let user = UsersForVerify[token];
    client.query(`
              INSERT INTO users(username, login, password)
              VALUES ('${user.data.username}', '${user.data.login}', '${user.data.password}')`,
        (err, result) => {
            if (err) {
                throw err;
            } else {
                if (result.rowCount) {

                    let res = {
                        type: 'signup',
                        data: "Sign up is success"
                    };
                    ws.send(JSON.stringify(res));
                }
            }
        }
    );

}
function GenerateToken() {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        { length: 50 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
    console.log(randomArray.join(""));
    return randomArray.join("");

}
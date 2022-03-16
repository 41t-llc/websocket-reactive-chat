require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const PORT = process.env.PORT || 3000;
const nodeMailer = require('nodemailer');
const INDEX = '/views/index.html';
const server = express()
  .use("/public", express.static(path.join(__dirname, '/public')))
  .use("/",(req, res) => res.sendFile(INDEX, {root: __dirname}))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// app
const app = express();
app.get("/api/verify", (req, res) => {
    console.log("VERIFY");
    console.log(req.query.token);

    VerifingUser(req.query.token, res);

})
app.listen(PORT+1);
// WebSocket
const { Server } = require('ws');
const wss = new Server({server});
// Transporter
const transporter = nodeMailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env["MAIL_USER"],
        pass: process.env["MAIL_USER"]
    }
});


let clients = [],
    clientsUserNames = [],
    UsersForVerify = [];
wss.on('connection', ws => {
    let id;


  console.log('Client connected');
    ws.try = 1;
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
                      client.query(`INSERT INTO messages("user",chat,date,text) VALUES (${result.rows[0].id},'${req.chat}','${curdate}','${req.text.replace('/\w/g',(match) => ("\\" + match))}')`,
                          (err, result) => {
                          if (err) throw err;
                              console.log(result);
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
                          ws.user = result.rows[0];
                          ws.send(JSON.stringify(res));
                          id = result.rows[0].id;
                          clients[result.rows[0].id] = ws;
                          clientsUserNames[id] = result.rows[0].username;
                          ws.send(JSON.stringify(res));
                          ws.try = "Sign in";
                          SendUsers();
                          SendChats(id);
                        }
                        else {
                           SendError("error","Data is incorrected");
                        }
                    })

                }
                else {
                      SendError("error","Data is incorrected");
                  }
                }
  })


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
            if(CheckEmail(req.email)) {
                let user = {
                    data: {
                        username: req.username,
                        login: req.login,
                        email: req.email,
                        password: hash
                    },
                    verifyToken: GenerateToken(),
                    timeOut: setTimeout(() => {
                        console.log("Delete User");
                        delete UsersForVerify[this.verifyToken];
                    }, 1800000)
                }
                UsersForVerify[user.verifyToken] = user;
                console.log("User add in list");
                transporter.sendMail({
                    from: process.env.mail,
                    to: req.email,
                    subject: "GPT VERIFY",
                    html: `
                  <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                            <meta http-equiv="X-UA-Compatible" content="ie=edge">
                            <title>MAIL</title>
                     
                            <style>
                            * {
                                padding: 0;
                                margin: 0;
                            }
                            
                            body {    
                                border-radius: 20px;
                                background-color: #FFFAAF
                            }
                            
                            a {
                                text-decoration: none;
                                font-size: 25px;
                            }
                            table {
                                width: 100%;
                            }
                            </style>
                        </head>
                        <body>
                        <table>
                            <tr style="min-height: 50px; background-color: #bdbbbb">
                                <td style="font-size: 40px; text-align: center">GPT GROUP</td>
                            </tr>
                            <tr>
                                <td>
                                    <span> Я люблю когда ссылки адекватны и мне нравятся 
                                        <a href="http://localhost:3001/api/verify?token=${user.verifyToken}">верификация</a>
                                    </span>
                                </td>
                            </tr>
                        </table>
                        </body>
                    </html>
                    `
                })
            }
            else {
                console.log("Такой пользователь уже есть");
            }
          })

        }
        break;

      case "Check":
          if(ws.try !== "Sign in") {
              if (ws.try%5 === 0) {
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
      case "getChatMessages":

          if(req.data.user === ws.user.username) {
              console.log(ws.user.id);
              client.query(`Select * from members where id_chat = '${req.data.chat}' and id_user = '${ws.user.id}'`, (err, result) => {
                  if (err) throw err;
                  if (result.rowCount) {
                      console.log(2)
                      client.query(`Select m.id,u.username as user, m.date, m.text from messages m right join users u on m.user = u.id where m.chat =  '${req.data.chat}'`, (err, result) => {
                          if(err) throw err;
                          console.log(3)
                          result.rows.map((message) =>  message.user = { name: message.user})
                          let res = {
                              type: "allmsg",
                              chat: req.data.chat,
                              messages: result.rows
                          }
                          ws.send(JSON.stringify(res));
                      })
                  }
              })
          }
      default:
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
     function SendChats(id) {
         let data;
         client.query(`SELECT c.id as chat,name,u.username as owner,u2.username as lastMessage,text,date FROM chats c left join users u on c.owner = u.id inner join users u2 right join messages on u2.id = messages.user on c.id = messages.chat where messages.id in (Select id from messages where chat = c.id order by id DESC limit 1) `, (err, result) => {
             if(err) throw err;
             if(result.rowCount) {

                 let res = {
                     type: "chats",
                     data: result.rows
                 }
                 ws.send(JSON.stringify(res));
             }
         });

    }

});
//Queries

// PostgreSQL
// #TODO Перед коммитом не забывайте включить ssl
const { Client } = require('pg');
const {json} = require("express");
const client = new Client({

  connectionString:  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/websocketapp",
 // ssl: { rejectUnauthorized: false}
});

client.connect();

function VerifingUser (token, res) {
    let user = UsersForVerify[token] || false,
        check = false;
    if(user) {
        res.redirect("http://localhost:3000");
        client.query(`
                  INSERT INTO users(username, login, password,email)
                  VALUES ('${user.data.username}', '${user.data.login}', '${user.data.password}','${user.data.email}')`,
            (err, result) => {
                if (err) throw err;

                if(!result.rowCount)  check = true;
            }
        );
        console.log("I send " + check);
    }
    else {
        res.redirect("/?errors=notoken");
    }
    return check;
}

function GenerateToken() {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        { length: 50 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
    return randomArray.join("");
}
async function CheckEmail(email) {
    let check = true;
    await client.query(`Select id from users where email = '${email}'`, (err, result) => {
        if(err) throw err;
        if(result.rowCount) {
            check = false;
        }
    });
    for (let x in UsersForVerify) {
        let y = UsersForVerify[x];
        if(y.data['email'] === email) {
            check = false;
            break;
        }

    }
    return check;
}

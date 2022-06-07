require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const PORT = process.env.PORT || 3000;
const nodeMailer = require('nodemailer');
const INDEX = '/views/index.html';
const server = express()
    .use("/public", express.static(path.join(__dirname, '/public')))
    .use("/", (req, res) => res.sendFile(INDEX, {root: __dirname}))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

// WebSocket
const {Server} = require('ws');
const wss = new Server({noServer: true});
// Transporter



server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

const transporter = nodeMailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
        user: process.env["MAIL_USER"],
        pass: process.env["MAIL_PASS"]
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
                    req.user.name !== "" && req.chat && req.chat.trim() !== '') {

                    client.query(`SELECT id
                                  FROM users
                                  WHERE username = '${req.user.name}'`, (err, result) => {
                        if (err) SendError('error', 'Пользователь не найден');
                        if (result.rowCount) {
                            let date = new Date(),
                                curdate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.toLocaleTimeString();
                            client.query(`INSERT INTO messages("user", chat, date, text)
                                          VALUES (${result.rows[0].id}, '${req.chat * 1}', '${curdate}',
                                                  '${req.text.replace('/\w/g', (match) => ("\\" + match))}')`,
                                (err, result) => {
                                    if (err) SendError("error", 'Чат не найден');
                                });
                            let res = {
                                type: 'msg',
                                text: req.text,
                                user: req.user,
                                date: new Date(),
                            }
                            res = JSON.stringify(res)

                            clients.forEach(client => {

                                client.send(res);
                            });
                        }
                    });


                } else {
                    SendError("error", 'Данных не хватает для добавление записи');
                }
                break;

            case 'signin':
                if (req.login !== "" &&
                    req.password !== "") {
                    req.login = req.login.replace('/\w/g', (match) => ("\\" + match));
                    req.password = req.password.replace('/\w/g', (match) => ("\\" + match));

                    client.query(`
                                SELECT *
                                FROM users
                                WHERE login = '${req.login}'`,
                        (err, result) => {

                            if (err) {
                                throw err;
                            } else {
                                if (result.rowCount) {
                                    bcrypt.compare(req.password, result.rows[0].password, (err, answer) => {
                                        if (err) throw err;
                                        if (answer) {
                                            let token = GenerateJWTToken(result.rows[0],"SECRET","14d"),
                                                res = {
                                                    type: 'signin',
                                                    user: {
                                                        name: result.rows[0].username
                                                    },
                                                    token: token
                                                };

                                            ws.user = result.rows[0];
                                            id = result.rows[0].id;
                                            clients[result.rows[0].id] = ws;
                                            clientsUserNames[id] = result.rows[0].username;
                                            ws.send(JSON.stringify(res));
                                            ws.try = "Sign in";
                                            SendUsers();
                                            SendChats(id);
                                        } else {
                                            SendError("error", "Data is incorrected");
                                        }
                                    })

                                } else {
                                    SendError("error", "Data is incorrected");
                                }
                            }
                        })
                }
                break;

            case 'signup':
                if (req.username !== "" &&
                    req.login !== "" &&
                    req.password !== "") {
                    req.username = req.username.replace('/\w/g', (match) => ("\\" + match));
                    req.login = req.login.replace('/\w/g', (match) => ("\\" + match));
                    req.password = req.password.replace('/\w/g', (match) => ("\\" + match));

                    client.query(`Select *
                                  from users
                                  where 'login' = '${req.login}'
                                     or 'email' = '${req.email}'`, (err, result) => {
                        if (err) throw err;
                        if (result.rowCount === 0) {
                            bcrypt.hash(req.password, saltRounds, (err, hash) => {
                                if (err) throw err;

                                if (CheckEmail(req.email)) {

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
                                    console.log(user.verifyToken)
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
                                                          <a href="${process.env['SERVER_URL']}?verifyToken=${user.verifyToken}">верификация</a>
                                                  </td>
                                              </tr>
                                          </table>
                                          </body>
                                      </html>
                                      `
                                              }, (err) => {
                                                  if(err) console.log('---');
                                              })
                                } else {
                                    console.log("dont add")
                                    SendError('error', 'Этот логин или эл.почта уже используется')
                                }
                            })

                        }
                    })


                }
                break;
            case 'verifyInviteToken':

                if(VerifingUser(req.token)) {
                    ws.send(JSON.stringify({
                        type: 'successVerify',
                        message: 'Пользователь подтвержден'
                    }))
                }
                else {
                    SendError('error','Токен не валиден');
                }
                break;
            case 'verifyToken':
                let answer = ValidateToken(req.token);
                if(answer) {
                    ws.user = answer;
                    ws.send(JSON.stringify({
                        type: 'validToken',
                        user: {
                            name: answer.username
                        }
                    }));
                    clients[ws.user.id] = ws;
                    clientsUserNames[id] = ws.user.username;
                    SendUsers();
                    SendChats(ws.user.id);
                }
                else {
                    ws.send(JSON.stringify({
                        type: 'noValidToken'
                    }))
                }
                break;
            case "Check":
                if (ws.try !== "Sign in") {
                    if (ws.try % 5 === 0) {
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

                if (req.data.user === ws.user.username) {
                    client.query(`Select *
                                  from members
                                  where id_chat = '${req.data.chat}'
                                    and id_user = '${ws.user.id}'`, (err, result) => {
                        if (err) throw err;
                        if (result.rowCount) {
                            client.query(`Select m.id, u.username as user, m.date, m.text
                                          from messages m right join users u
                                          on m.user = u.id
                                          where m.chat = '${req.data.chat}'`, (err, result) => {
                                if (err) throw err;
                                result.rows.map((message) => message.user = {name: message.user})
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
                break;

            case 'createChat':
                if (req.data.user === ws.user.username) {
                    let pattern = /^[a-zA-Z0-9]{5,}$/
                    if (req.data.url.trim().length === 0 || !pattern.test(req.data.url)) {
                        req.data.url = GenerateToken();
                    }
                    client.query(`Insert into chats(name, owner, url)
                                  VALUES ('${req.data.name}', '${ws.user.id}', '${req.data.url}')`, (err, res) => {
                        if (err) {
                            SendError('dataBusy', 'Такая ссылка уже используется');
                        } else {
                            let data = {
                                type: 'success',
                                message: "Чат добавлен!"
                            }
                            ws.send(JSON.stringify(data))
                            SendChats(ws.user.id);
                        }
                    })
                }
                break;

            case 'deleteChat':
                if (req.data.user === ws.user.username) {
                    if (req.data.chat_id !== '') {
                                client.query(`Delete
                                              from chats
                                              where id = ${req.data.chat_id} AND owner = ${ws.user.id}`, (err, res) => {
                                    if (err) throw err;
                                    let data = {
                                        type: "successDelete",
                                        message: "Чат успешно  удален"
                                    }
                                    ws.send(JSON.stringify(data));
                                });
                            }
                        clients.forEach((x, index) => {
                            SendChats(index);
                        })
                    }

                break;
            case 'invite':
                let data = ValidateToken(req.user);
                if(data.id === ws.user.id)  {
                    client.query(`Select id from chats where url = '${req.url}'`,(err,result) =>{
                        if(err) throw err;
                        if(result.rowCount) {
                            client.query(`Select * from members where id_chat = ${result.rows[0].id} and id_user = ${ws.user.id}`,(err,result2) =>{
                        if(err) throw err;
                        if(!result2.rowCount) {
                            client.query(`Insert into members (id_user,id_chat) VALUES (${ws.user.id},${result.rows[0].id})`,  (err,res) => {
                                if(err) throw err;
                                SendChats(ws.user.id)
                                ws.send(JSON.stringify({
                                    type: 'inviteSuccess'
                                }));
                            });
                        }
                        else {
                            SendError('error','Вы уже участник этого чата');
                        }
                        });

                        }
                        else {
                            SendError('error','Такого чата не существует')

                        }

                    })
                }

                break;
            case 'exitChat':
                if (req.data.user === ws.user.username) {
                    if (req.data.chat_id !== '') {
                        client.query(`Select *
                                      from members
                                      where id_chat = ${req.data.chat_id}
                                        AND id_user = ${ws.user.id}`, (err, res) => {
                            if (err) throw err;
                            if (!res.rowCount) {
                                SendError('Not found', 'Данный пользователь не принадлежит к чату');
                            } else {
                                client.query(`Delete
                                              from members
                                              where 'id_chat' = ${req.data.chat_id}
                                                AND 'id_user' = ${ws.user.id}`, (err, res) => {
                                    if (err) throw err;
                                    let data = {
                                        type: "successDelete",
                                        message: "Вы вышли удачно"
                                    }
                                    ws.send(JSON.stringify(data));
                                    SendChats(ws.user.id);
                                });
                            }
                        })
                    }
                }
                break;

            default:
            // Что-то

        }
    });
    ws.on('close', () => {
        console.log('Client disconnected' + id)
        if (id) {
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
        let data = [];
        clientsUserNames.filter(x => {
            return x !== null
        });
        clientsUserNames.map((x, i) => {
            x != null ? data[i] = {name: x} : false
        })
        let res = {
            type: "activityUsers",
            activityUsers: data
        }
        clients.forEach(client => {
            client.send(JSON.stringify(res));
        });
    }

    function SendChats(id) {
        client.query(`select c.id as chat, c.name as name, u.username as owner, c.url as url
                      from members m
                               inner join chats c on c.id = m.id_chat
                               left join users u on u.id = c.owner
                      where m.id_user = ${id}`, (err, result) => {
            if (err) throw err;
            if (result.rowCount) {
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
const {Client} = require('pg');
const {json} = require("express");
const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/websocketapp",
    // ssl: { rejectUnauthorized: false}
});

client.connect();

function VerifingUser(token) {
    let user = UsersForVerify[token] || false,
        check = false;
    if (user) {
        client.query(`
                    INSERT INTO users(username, login, password, email)
                    VALUES ('${user.data.username}', '${user.data.login}', '${user.data.password}', '${user.data.email}')`,
            (err, result) => {
                if (err) throw err;
                if (!result.rowCount) check = true;
            }
        );
       check = true;
    } else {
       check = false;
    }

    return check
}

function GenerateToken() {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        {length: 50},
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
    return randomArray.join("");
}

function CheckEmail(email) {
    let check = true;
    client.query(`Select id
                  from users
                  where email = '${email}'`, (err, result) => {
        if (err) throw err;
        if (result.rowCount) {
            return false;
        }
    });

    for (let x in UsersForVerify) {
        let y = UsersForVerify[x];
        console.log(UsersForVerify)
        if (y.data['email'] === email) {
            return false;
        }
    }
    return check;
}

function GenerateJWTToken(data,type,time) {
    let jwtSK = process.env['JWT_'+type+'_KEY'];
    return jwt.sign(data, jwtSK, {
        expiresIn: time
    });
}

function ValidateToken(token) {
    let jwtSK = process.env["JWT_SECRET_KEY"],
        answer;
        jwt.verify(token, jwtSK, function (err,decoded) {
            if(err) answer = false;
            else {
                answer = decoded;
            }
    });
return answer
}


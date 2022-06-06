import Builder from "./classes/builder.js";
import Watcher from "./watcher.js"



async function app() {

    let body = document.body,
        ws = connect(),
        builder = new Builder(),
        blockInfo = document.querySelector("#info"),
        menu = document.querySelector('#menu'),
        info = document.querySelector('#buttonInfo'),
        condition = document.querySelector('#condition'),
        indicator = document.querySelector('#indicator'),
        chatList = document.querySelector('#chatsList'),
        blockClose = document.getElementById("closeAll"),
        flagSettings = false,
        flagInfo = false,
        theme = document.querySelector("#ThemeSwitch"),
        settings = document.querySelector('#buttonSettings'),
        sysmes = document.querySelector('#sysmes'),
        censored = document.querySelector('#censored'),
        signin = document.querySelector('article.signin'),
        signup = document.querySelector('article.signup'),
        addChat = document.querySelector('.addChat'),
        switcherForms = document.querySelectorAll('.formSwitch'),
        forms = document.forms,
        messages = [],
        d = null,
        JWTtoken = localStorage.getItem('token'),
        connectionTries = null;

    window.App = Watcher({
        data: {
            user: {
                name: "test"
            },
            chats: {
                chatList: [],
                chatInfo: {
                    currentChat: 0,
                    name: "Нету",
                    activeUsers: [
                        {
                            name: 'Sergey',
                            status: 'online'
                        },
                        {
                            name: 'Dima',
                            status: 'online'
                        },
                        {
                            name: 'Ivan',
                            status: 'online'
                        }
                    ],
                    owner: "Не выбран"
                }
            },
            chatMessagesRender() {
                let block;
                if (this.chats.chatInfo.currentChat > 0) {
                    console.log('test')
                } else {
                    return `<article class="center">Выберите чат</article>`
                }
            },
            chatButtons() {
                let block = null;
                if(this.chats.chatInfo.owner === this.user.name) {
                    block = document.createElement('button');
                    block.addEventListener('onclick', (event) => {
                        if (window.App.data.user.name) {
                            ws.send(JSON.stringify({
                                type: 'deleteChat',
                                data: {
                                    chat_id: window.App.data.chats.chatInfo.currentChat,
                                    user: window.App.data.user.name
                                }
                            }))
                        }
                        event.preventDefault()
                    })
                    block.textContent = 'Удалить чат'
                    return block;
                }
                else {
                    block = document.createElement('button');
                    block.addEventListener('onclick', (event) => {
                        if (window.App.data.user.name) {
                            ws.send(JSON.stringify({
                                type: 'exitChat',
                                data: {
                                    chat_id: window.App.data.chats.chatInfo.currentChat,
                                    user: window.App.data.user.name
                                }
                            }))
                        }
                        event.preventDefault()
                    })
                    block.textContent = 'Выйти из чата'
                    return block;
                }

            }
        }
    });


    builder.container = document.querySelector('#chat');


    localStorage.getItem("theme") === "black" ? theme.checked = true : theme.checked = false;
    body.classList.add(localStorage.getItem("theme") || "white");

    forms['message'].onsubmit = function () {
        if (this.text.value.trim() !== '' &&
            window.App.data.user.name !== undefined) {
            let message = {
                type: 'msg',
                token: JWTtoken,
                user: window.App.data.user,
                chat: builder.chat,
                text: this.text.value.trim()
            };

            this.text.value = '';
            ws.send(JSON.stringify(message));
        } else {
            this.text.focus();
        }
        return false;
    }

    forms['signin'].onsubmit = function () {
        if (this.login.value !== '' && this.password.value !== '') {
            let message = {
                type: 'signin',
                login: this.login.value,
                password: this.password.value
            };

            this.password.value = '';
            ws.send(JSON.stringify(message));
        } else {
            alert('Проверьте данные');
        }
        return false;
    }
    forms['addChat'].onsubmit = function (event) {
        event.preventDefault()
        if (this.name.value.trim() !== '') {
            ws.send(JSON.stringify({
                type: 'createChat',
                data: {
                    user: window.App.data.user.name,
                    name: this.name.value.trim(),
                    url: this.url.value.trim()
                }
            }))
        } else {
            alert("Вы не ввели название чата");
        }

    }


    forms['signup'].onsubmit = function () {
        if (this.login.value.trim() !== '' &&
            this.username.value.trim() !== '' &&
            this.password.value.trim() !== '' &&
            validateEmail(this.email.value.trim()) && this.password.value === this.confirmPassword.value) {
            let message = {
                type: 'signup',
                email: this.email.value.trim(),
                username: this.username.value.trim(),
                password: this.password.value.trim(),
                login: this.login.value.trim()
            }
            ws.send(JSON.stringify(message))
        } else {
            alert('Проверьте данные');
        }
        return false;
    }

    Object.keys(switcherForms).map(x => {
        switcherForms[x].addEventListener('click', builder.authFormSwitch);
    });


    logout.onclick = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    }



    censored.onchange = () => {
        while (chat.firstChild) {
            chat.removeChild(chat.firstChild);
        }
        messages.map(x => builder.createMessage(x));
    }

    document.querySelector('#themeSwitch').onchange = (e) => {
        if (e.target.checked) {
            localStorage.setItem('theme', 'black');
            document.body.classList.remove('white');
            document.body.classList.add('black')
        } else {
            document.body.classList.remove('black');
            document.body.classList.add('white')
            localStorage.setItem('theme', 'white');
        }
    }

    document.querySelector("#closeAll").onclick = () => {
        closeAll();
    }
    function closeAll () {
        flagSettings = false;
        document.querySelector('.blockSettings').style.display = 'none';
        blockInfo.classList.add("d-n");
        chatList.classList.remove("active");
        addChat.classList.add('d-n');
        body.classList.remove('gap-15')
        document.querySelector("#closeAll").classList.add("d-n");
    }
    settings.onclick = () => {
        toggleSettings();
    }

    info.onclick = () => {
        toggleInfo();
    }

    menu.onclick = () => {
        blockClose.classList.remove("d-n");
        body.classList.toggle('gap-15');
        chatList.classList.toggle("active");
        document.querySelector("#closeAll").classList.remove('d-n');
    }

    addChatButton.onclick = () => {
        addChat.classList.toggle('d-n');
        chatList.classList.toggle("active");
    }

    function toggleSettings() {
        flagSettings = !flagSettings;
        blockClose.classList.remove("d-n");
        if (flagSettings) {
            document.querySelector('.blockSettings').style.display = '';
        } else {
            document.querySelector('.blockSettings').style.display = 'none';
        }
    }

    function toggleInfo() {
        blockClose.classList.remove("d-n");
        blockInfo.classList.toggle("d-n");
    }

    function validateEmail(email) {
        var re = /[a-z0-9]{5,}@[a-z]{2,}\.[a-z]{2,5}/;
        return re.test(String(email).toLowerCase());
    }

    function showChat() {
        condition.classList.remove('d-n');
        body.classList.add('grid-row-3', 'grid-auto-1');
        chatList.classList.remove("d-n");
        signin.classList.add('d-n');
        signup.classList.add('d-n');
        signin.classList.remove('flex');
        signup.classList.remove('flex');
        forms['message'].style.display = 'grid';
        chat.style.display = 'block';
    }

    function connect() {
        let HOST = location.origin.replace(/^http/, 'ws'), //'ws://localhost:3000';
            ws = new WebSocket(HOST);

        ws.addEventListener('open', onOpen)
        ws.addEventListener('message', onMessage)
        ws.addEventListener('close', onClose)
        ws.addEventListener('error', onError)
        return ws;
    }

    function onMessage(event) {
        let message = JSON.parse(event.data);

        switch (message.type) {

            case 'msg':
                messages.push(message);
                builder.createMessage(message);
                break;

            case 'signin':
                localStorage.setItem("token", message.token)
                App.data.user = message.user;
                builder.user = App.data.user;
                builder.ws = ws
                showChat();
                break;

            case 'signup':
                signup.classList.add('d-n');
                signin.classList.remove('d-n');
                signin.classList.add('flex');
                signup.classList.remove('flex');
                break;

            case 'allmsg':
                messages = message.messages;
                if(message.messages.length == 0) {
                    chat.innerHTML = `<p class="center">Сообщений в чате пока-что нет</p>`
                }
                else {
                    message.messages.map((msg) => {
                        builder.createMessage(msg);
                    });
                }

                break;

            case 'activityUsers':
                // window.App.data.chats.chatInfo.activeUsers = message.activityUsers.filter(x => {
                //     return x !== null
                // });
                break;

            case 'error':
                alert(message.error)
                break;

            case 'close':
                if (!confirm("Вы не успели войти в систему")) {
                    ws.close();
                    clearInterval(d);
                }
                break;
            case 'validToken': {

                App.data.user = message.user;
                builder.user = App.data.user;
                builder.ws = ws
                showChat();
                break;
            }
            case 'noValidToken': {
                alert("Ваш токен истек или его данные устарели");
                break;
            }
            case 'chats':
                builder.renderChats(message.data);
            break;
            case 'successDelete':
                alert(message.message);
                window.App.data.chats.chatInfo.currentChat = 0;
                builder.currentChat = 0;
                closeAll();
                break;
            default:
            // Что-то
        }
    }

    function onError(event) {
        indicator.classList.add('error');
        indicator.classList.remove('success');
        sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
        connectionTries = setInterval(() => {
            if (ws.readyState === 1) {
                clearInterval(connectionTries);
            } else {
                ws.close();
                ws = connect();
            }
        }, 5000);
    }

    function onOpen(event) {
        indicator.classList.add('success');
        indicator.classList.remove('error');
        sysmes.innerHTML = 'Соединение установлено';
        if (!JWTtoken) {
            d = setInterval(() => {
                let data = {
                    type: "Check"
                }
                ws.send(JSON.stringify(data));
            }, 10000);

        } else {
            ws.send(JSON.stringify({
                type: "verifyToken",
                token: JWTtoken
            }))
            if (window.location.search) {
                let parametrs = new URLSearchParams(window.location.search);
                if (parametrs.get('url') && localStorage.getItem("token")) {
                    let data = {
                        type: 'invite',
                        url: parametrs.get('url'),
                        user: JWTtoken
                    }
                    ws.send(JSON.stringify(data))
                }
            }
        }

    }

    function onClose(event) {
        indicator.classList.add('error');
        indicator.classList.remove('success');
        sysmes.innerHTML = 'Соединение закрыто: <br>';
        sysmes.innerHTML += `<i>код: ${event.code} - Обратитесь в технику безопасности</i>`;
    }
}

app();

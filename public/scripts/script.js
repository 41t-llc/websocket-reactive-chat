import chatInfo from "./classes/chatInfo.js";
import Builder from "./classes/builder.js";
import Wathcer from "./watcher.js"
if(window.location.search) {
     let parametrs = new URLSearchParams(window.location.search);
     if(parametrs.get('errors')) {
         if(confirm("Ваш токен просрочен, пожалуйста пройдите регистрацию снова")) {
             window.location.href = window.location.origin;
            }
     }
     if(parametrs.get('chat') &&  localStorage.getItem("token")) {
        let data = {
            url: parametrs.get('chat'),
            user: localStorage.getItem("token")
        }
        fetch(`api/invite?=chat=${parametrs.get('chat')}`).finally(() => {window.location = window.location.origin});
     }

}
/*
* Хранить загруженные сообщения в сессии
* */



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
        connectionTries = null,
        user = new Wathcer({
            name: null,
        });
    let messagesTest = new Wathcer({
        messages: [{
            messageText: null,
            owner: null
        }]
    });
    messagesTest.messages = [{
        messageText: "Tetatastast",
        owner: "taetaet"
    },
        { messageText: "Tetatastast1",
            owner: "taetaet2"}
    ];
    builder.container = document.querySelector('#chat');
    builder.chatinfo = new Wathcer({
        owner: null,
        name: null,
        activeUsers: []
    });

    localStorage.getItem("theme") === "black" ? theme.checked = true : theme.checked = false;
    body.classList.add(localStorage.getItem("theme") || "white");
    // ws.onopen = function (event) {
    //     indicator.classList.add('success');
    //     indicator.classList.remove('error');
    //
    //     sysmes.innerHTML = 'Соединение установлено';
    //     console.log("kek");
    //     d = setInterval(() => {
    //         let data = {
    //             type: "Check"
    //         }
    //         ws.send(JSON.stringify(data));
    //     }, 10000);
    //
    //
    // };
    //
    // ws.onclose = function (event) {
    //     indicator.classList.add('error');
    //     indicator.classList.remove('success');
    //     sysmes.innerHTML = 'Соединение закрыто: <br>';
    //     // TODO: Нужно ли перенести в условие?
    //     sysmes.innerHTML += `<i>код: ${event.code} причина: ${event.reason}</i>`;
    // };
    //
    //
    // ws.onmessage = async function (event) {
    //     let message = JSON.parse(event.data);
    //
    //     switch (message.type) {
    //
    //         case 'msg':
    //             messages.push(message);
    //             builder.createMessage(message);
    //             break;
    //
    //         case 'signin':
    //             user = message.user;
    //             builder.user = user;
    //             builder.ws = ws
    //             builder.createStartView();
    //             showChat();
    //
    //             break;
    //
    //         case 'signup':
    //             user = message.user;
    //             signup.classList.add('d-n');
    //             signin.classList.remove('flex');
    //             signup.classList.remove('flex');
    //             break;
    //
    //         case 'allmsg':
    //             messages = message.messages;
    //
    //             message.messages.map((msg) => {
    //                 builder.createMessage(msg);
    //             });
    //             break;
    //
    //         case 'activityUsers':
    //             ShowUsers(message.activityUsers);
    //             break;
    //
    //         case 'error':
    //             alert(message.error)
    //             break;
    //
    //         case 'close':
    //             if (!confirm("Вы не успели войти в систему")) {
    //                 ws.close();
    //                 clearInterval(d);
    //             }
    //             break;
    //         case 'chats':
    //             builder.renderChats(message.data);
    //
    //         default:
    //         // Что-то
    //
    //     }
    // };
    //
    // ws.onerror =  function (event) {
    //     indicator.classList.add('error');
    //     indicator.classList.remove('success');
    //     sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
    //     connectionTries =  setInterval ( () => {
    //         ws.readyState === 1 ? clearInterval(connectionTries) : ws = new WebSocket(HOST);
    //        }, 5000);
    // };

    forms['message'].onsubmit = function () {
        if (this.text.value.trim() !== '' &&
            user.name !== undefined) {
            let message = {
                type: 'msg',
                user: user,
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
    forms['addChat'].onsubmit = function () {
        if(this.chatName.value.trim() !== '') {
            let message = {
                type: 'addChat',
                name: this.chatName.value,
                url: this.url.value
            }

            ws.send(JSON.stringify(message));
        }
        else {
            alert("Вы не ввели название чата");
        }
        return false;
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
    document.querySelector("#closeAll").onclick = function () {
        flagSettings = false;
        document.querySelector('.blockSettings').style.display = 'none';
        blockInfo.classList.add("d-n");
        chatList.classList.remove("active");
        addChat.classList.add('d-n');
        this.classList.toggle("d-n");
    }
    settings.onclick = () => {
        toggleSettings();
    }
    info.onclick = () => {
        toggleInfo();
    }
    menu.onclick = () => {
        blockClose.classList.toggle("d-n");
        body.classList.toggle('gap-15');
        chatList.classList.toggle("active");
    }
    addChatButton.onclick = () => {
        addChat.classList.toggle('d-n');
        chatList.classList.toggle("active");
    }

    function ShowUsers(listUsers) {
        while (users.firstChild) {
            users.removeChild(users.firstChild);
        }
        listUsers.forEach(user => {
            users.innerHTML += `
      <div data-model="name"></div>
    `
        })
    }

    function toggleSettings() {
        flagSettings = !flagSettings;
        blockClose.classList.toggle("d-n");
        if (flagSettings) {
            document.querySelector('.blockSettings').style.display = '';
        } else {
            document.querySelector('.blockSettings').style.display = 'none';
        }
    }

    function toggleInfo() {
        blockClose.classList.toggle("d-n");
        blockInfo.classList.toggle("d-n");
    }

    function validateEmail(email) {
        var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return re.test(String(email).toLowerCase());
    }

    // После  авторизации отрисовывает меню навигации
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
    function authFormSwitch() {
        let signin = document.querySelector('article.signin'),
            signup = document.querySelector('article.signup');

        signin.classList.toggle('flex');
        signin.classList.toggle('d-n');
        signup.classList.toggle('flex');
        signup.classList.toggle('d-n');
    }

    function connect() {
        let HOST = location.origin.replace(/^http/, 'ws'), //'ws://localhost:3000';
            ws = new WebSocket(HOST);

        ws.addEventListener('open',onOpen)
        ws.addEventListener('message',onMessage)
        ws.addEventListener('close',onClose)
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
                user = message.user;
                builder.user = user;
                builder.ws = ws
                builder.createStartView();
                showChat();

                break;

            case 'signup':
                user = message.user;
                signup.classList.add('d-n');
                signin.classList.remove('flex');
                signup.classList.remove('flex');
                break;

            case 'allmsg':
                messages = message.messages;

                message.messages.map((msg) => {
                    builder.createMessage(msg);
                });
                break;

            case 'activityUsers':
                ShowUsers(message.activityUsers);
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
            case 'chats':
                builder.renderChats(message.data);

            default:
            // Что-то

        }
    }
    function onError(event) {
        indicator.classList.add('error');
        indicator.classList.remove('success');
        sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
        connectionTries =  setInterval ( () => {
            ws.readyState === 1 ? clearInterval(connectionTries) : ws = connect();
        }, 5000);
    }
    function onOpen(event) {
        indicator.classList.add('success');
        indicator.classList.remove('error');

        sysmes.innerHTML = 'Соединение установлено';
        console.log("kek");
        d = setInterval(() => {
            let data = {
                type: "Check"
            }
            ws.send(JSON.stringify(data));
        }, 10000);
    }
    function onClose(event) {
        indicator.classList.add('error');
        indicator.classList.remove('success');
        sysmes.innerHTML = 'Соединение закрыто: <br>';

        sysmes.innerHTML += `<i>код: ${event.code} - Обратитесь в технику безопасности</i>`;
    }

}


app();
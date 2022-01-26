console.log(window.location.search)
if(window.location.search) {
  if(confirm("Ваш токен просрочен, пожалуйста пройдите регистрацию снова")) {
    window.location.href = window.location.url;
  }
}

async function app() {

  let HOST = location.origin.replace(/^http/, 'ws'), //'ws://localhost:3000';
      ws = new WebSocket(HOST),
      body = document.body,
      builder = new BuilderClass(),
      chat = document.querySelector('#chat'),
      blockInfo = document.querySelector("#info"),
      menu = document.querySelector('#menu'),
      condition = document.querySelector('#condition'),
      indicator = document.querySelector('#indicator'),
      flagSettings = false,
      flagInfo = false,
      theme = document.querySelector("#ThemeSwitch"),
      settings = document.querySelector('#buttonSettings'),
      sysmes = document.querySelector('#sysmes'),
      censored = document.querySelector('#censored'),
      signin = document.querySelector('article.signin'),
      signup = document.querySelector('article.signup'),
      closeSettings = document.querySelector('article#closeSettings'),
      forms = document.forms,
      user = {},
      messages = [],
      prevdate = null,
      d = null,
      connectionTries = null;


   localStorage.getItem("theme") === "black" ? theme.checked = true : theme.checked = false;
   body.classList.add(localStorage.getItem("theme") || "white");
  ws.onopen = function (event) {
    indicator.classList.add('success');
    indicator.classList.remove('error');
    sysmes.innerHTML = 'Соединение установлено';
    d = setInterval(() => {
      let data = {
        type: "Check"
      }
      console.log("I send data");
      ws.send(JSON.stringify(data));
    }, 10000);
    clearInterval(connectionTries);
  };

  ws.onclose = function (event) {
    indicator.classList.add('error');
    indicator.classList.remove('success');
      sysmes.innerHTML = 'Соединение закрыто: <br>';
    // TODO: Нужно ли перенести в условие?
    sysmes.innerHTML += `<i>код: ${event.code} причина: ${event.reason}</i>`;
  };


   ws.onmessage = async function (event) {
    let message = JSON.parse(event.data);

    switch (message.type) {

      case 'msg':
        messages.push(message);
        addMessage(message);
        break;

      case 'signin':
        user = message.user;
        signin.classList.add('d-n');
        signup.classList.add('d-n');
        signin.classList.remove('flex');
        signup.classList.remove('flex');
        forms['message'].style.display = 'grid';
        chat.style.display = 'block';
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
          builder.createMessage(chat,msg);
        });
        break;

      case 'activityUsers':
        ShowUsers(message.activityUsers);
        break;

      case 'error':
        alert(message.error)
            break;

      case 'close':
       if(!confirm("Вы не успели войти в систему")) {
         ws.close();
         clearInterval(d);
       }
       break;
      default:
        // Что-то

    }
  };

  ws.onerror = function (event) {
    indicator.classList.add('error');
    indicator.classList.remove('success');
    sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
    connectionTries = setInterval(() => {
      ws = new WebSocket(HOST);
    }, 1000);

  };

  forms['message'].onsubmit = function () {
    if (this.text.value.trim() !== '' &&
        user.name !== undefined) {
      let message = {
        type: 'msg',
        user: user,
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
  censored.onchange = () => {
    while(chat.firstChild) {
      chat.removeChild(chat.firstChild);
    }
    messages.map(x => addMessage(x));
  }
  closeSettings.onclick = () => {
    toggleSettings();
  }
  document.querySelector('#themeSwitch').onchange = (e) => {
    if(e.target.checked) {
      localStorage.setItem('theme','black');
      document.body.classList.remove('white');
      document.body.classList.add('black')
    }
    else {
      document.body.classList.remove('black');
      document.body.classList.add('white')
      localStorage.setItem('theme','white');
    }
  }
  document.querySelector("#closeInfo").onclick = () => {
    toggleInfo();
  }
  settings.onclick = () => {
    toggleSettings();
  }
  menu.onclick = () => {
    toggleInfo();
  }

  function ShowUsers(listUsers) {
    while(users.firstChild) {
      users.removeChild(users.firstChild);
    }
    listUsers.forEach(user => {
      users.innerHTML += `
      <div> ${user}</div>
    `
    })
  }
  function toggleSettings () {
    flagSettings = !flagSettings;
    if(flagSettings) {
      document.querySelector('.blockSettings').style.display = '';
    }
    else {
      document.querySelector('.blockSettings').style.display = 'none';
    }
  }
  function toggleInfo () {
    blockInfo.classList.toggle("d-n");
  }

  function validateEmail(email) {
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return re.test(String(email).toLowerCase());
  }
  
}

class BuilderClass {
  constructor() {
    this.prevdate = null;
  }
  createMessage(container,data) {
    let children = container.children,
        datemsg = new Date(data.date).toLocaleTimeString().substring(0, 5),
        date = new Date(data.date),
        text = censored.checked ? data.text.split(" ").map(word => testsWords.includes(word.toLowerCase()) ? '*'.repeat(word.length) : word).join(" ") : data.text;
    if (children.length > 0) {
      let lastChild = children[children.length - 1];
      if (this.prevdate !== date.getDate()) {
        this.prevdate = date.getDate();
        container.innerHTML += `
          <div class="relative sprdate flex center"> 
            <hr class="absolute">
            <p class="">${date.getDate()} ${date.toLocaleTimeString("default", {month: "short"}).substring(0, 5)}</p>
          </div>
        `;
      }
      if (lastChild.children[0].innerText === data.user.name) {
        lastChild.children[1].innerHTML += `
          <article class='message flex ai-c grid gap-15'>
            <i>${datemsg}</i>
            <span>${text}</span>
          </article>`;
      } else {
        container.innerHTML += `
          <article class='user_message mymsgs'>
            <p class='m'>${data.user.name}</p>
            <section class='items grid gap'>
              <article class='message flex ai-c grid gap-15'>
                <i>${datemsg}</i>
                <span>${text}</span>
              </article>
            </section>
          </article>`;
      }
    } else {
      container.innerHTML += `
        <article class='user_message mymsgs'>
          <p class='m'>${data.user.name}</p>
          <section class='items grid gap'>
            <article class='message flex ai-c grid gap-15'>
              <i>${datemsg}</i>
              <span>${text}</span>
            </article>
          </section>
        </article>`;
    }
    container.scrollTop = container.scrollHeight;
  }

  createChat(data) {

  }

  createChats() {

  }

  createForms() {

  }

  createSettings() {

  }
}


app();
function authFormSwitch() {
  let signin = document.querySelector('article.signin'),
      signup = document.querySelector('article.signup');

  signin.classList.toggle('flex');
  signin.classList.toggle('d-n');
  signup.classList.toggle('flex');
  signup.classList.toggle('d-n');
}

function app() {
  let HOST = location.origin.replace(/^http/, 'ws'), //'ws://localhost:3000';
      ws = new WebSocket(HOST),
      chat = document.querySelector('#chat'),
      condition = document.querySelector('#condition'),
      indicator = document.querySelector('#indicator'),
      sysmes = document.querySelector('#sysmes'),
      signin = document.querySelector('article.signin'),
      signup = document.querySelector('article.signup'),
      forms = document.forms,
      user = {};

  ws.onopen = function(event) {
    indicator.classList.add("success");
    indicator.classList.remove("error");
    sysmes.innerHTML = "Соединение установлено";

  };

  ws.onclose = function(event) {
    indicator.classList.add("error");
    indicator.classList.remove("success");

    if (event.wasClean) {
      sysmes.innerHTML = "Соединение закрыто: <br>";
    } else {
      sysmes.innerHTML = "Соединения как-то закрыто <br>";
    }
    // TODO: Нужно ли перенести в условие?
    sysmes.innerHTML += `<i>код: ${event.code} причина: ${event.reason}</i>`;
  };

  ws.onmessage = function(event) {
    let message = JSON.parse(event.data);

    switch (message.type) {

      case 'msg':
        addMessage(message);
        break;

      case 'signin':
        user = message.user;
        signin.classList.add('d-n');
        signup.classList.add('d-n');
        signin.classList.remove('flex');
        signup.classList.remove('flex');
        forms["message"].style.display = "grid";
        chat.style.display = 'block';
        break;

      case 'signup':
        user = message.user;
        signin.classList.add('d-n');
        signup.classList.add('d-n');
        signin.classList.remove('flex');
        signup.classList.remove('flex');
        forms["message"].style.display = "grid";
        chat.style.display = 'block';
        break;

      case 'allmsg':
        message.messages.map((msg) => addMessage(msg))
        break;

      default:
        // Что-то

    }
  };

  ws.onerror = function(event) {
    indicator.classList.add("error");
    indicator.classList.remove("success");
    sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
  };

  forms["message"].onsubmit = function() {
    if (this.text.value.trim() !== "" &&
        user.name !== undefined) {
      let message = {
        type: 'msg',
        user: user,
        text: this.text.value.trim()
      };

      this.text.value = "";
      ws.send(JSON.stringify(message));
    } else {
      this.text.focus();
    }
    return false;
  }

  forms["signin"].onsubmit = function () {
    if (this.login.value !== "" && this.password.value !== "") {
      let message = {
        type: 'signin',
        login: this.login.value,
        password: this.password.value
      };

      this.password.value = '';
      ws.send(JSON.stringify(message));
    } else {
      alert("Проверьте данные");
    }
    return false;
  }

  forms["signup"].onsubmit = function () {
    if (this.login.value.trim() !== "" &&
        this.username.value.trim() !== "" &&
        this.password.value.trim() !== "") {
      let message = {
        type: "signup",
        username: this.username.value.trim(),
        password: this.password.value.trim(),
        login: this.login.value.trim()
      }
      ws.send(JSON.stringify(message))
    } else {
      alert("Проверьте данные");
    }
    return false;
  }

  document.querySelector("#themeSwitch").onclick = () => {
    document.body.classList.toggle("white");
    document.body.classList.toggle("black");
  }
}
function addMessage (message) {
  let children = chat.children;
  message.date = new Date(message.date).toLocaleTimeString().substring(0,5);
  if (children.length > 0) {
    let lastChild = children[children.length - 1];

    if (lastChild.children[0].innerText === message.user.name) {
      lastChild.children[1].innerHTML += `
          <article class="message flex ai-c grid gap-15">
            <i>${message.date}</i>
            <span>${message.text}</span>
          </article>`;
    } else {
      chat.innerHTML += `
          <article class="user_message mymsgs">
            <p class="m">${message.user.name}</p>
            <section class="items grid gap">
              <article class="message flex ai-c grid gap-15">
                <i>${message.date}</i>
                <span>${message.text}</span>
              </article>
            </section>
          </article>`;
    }
  } else {
    chat.innerHTML += `
        <article class="user_message mymsgs">
          <p class="m">${message.user.name}</p>
          <section class="items grid gap">
            <article class="message flex ai-c grid gap-15">
              <i>${message.date}</i>
              <span>${message.text}</span>
            </article>
          </section>
        </article>`;
  }
  chat.scrollTop = chat.scrollHeight;
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

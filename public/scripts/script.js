function app() {
  let HOST = location.origin.replace(/^http/, 'ws'), //'ws://localhost:3000';
      ws = new WebSocket(HOST),
      chat = document.querySelector('#chat'),
      condition = document.querySelector('#condition'),
      indicator = document.querySelector('#indicator'),
      flagSettings = false,
      settings = document.querySelector('#buttonSettings'),
      sysmes = document.querySelector('#sysmes'),
      censored = document.querySelector('#censored'),
      signin = document.querySelector('article.signin'),
      signup = document.querySelector('article.signup'),
      forms = document.forms,
      user = {};
      // kemoji = KEmoji.initByClass('smiles', {
      //   width: 400,
      //   height: 200,
      //   smileContainerWidth: 280,
      //   smileContainerHeight: 150,
      //   smiles: ['D83DDE0A', 'D83DDE03', 'D83DDE09', 'D83DDE06', 'D83DDE1C', 'D83DDE0B', 'D83DDE0D', 'D83DDE0E', 'D83DDE12', 'D83DDE0F', 'D83DDE14', 'D83DDE22', 'D83DDE2D', 'D83DDE29', 'D83DDE28', 'D83DDE10', 'D83DDE0C', 'D83DDE04', 'D83DDE07', 'D83DDE30', 'D83DDE32', 'D83DDE33', 'D83DDE37', 'D83DDE02', '2764', 'D83DDE1A', 'D83DDE15', 'D83DDE2F', 'D83DDE26', 'D83DDE35', 'D83DDE20', 'D83DDE21', 'D83DDE1D', 'D83DDE34', 'D83DDE18', 'D83DDE1F', 'D83DDE2C', 'D83DDE36', 'D83DDE2A', 'D83DDE2B', '263A', 'D83DDE00', 'D83DDE25', 'D83DDE1B', 'D83DDE16', 'D83DDE24', 'D83DDE23', 'D83DDE27', 'D83DDE11', 'D83DDE05', 'D83DDE2E', 'D83DDE1E', 'D83DDE19', 'D83DDE13', 'D83DDE01', 'D83DDE31', 'D83DDE08', 'D83DDC7F', 'D83DDC7D', 'D83DDC4D', 'D83DDC4E', '261D', '270C', 'D83DDC4C', 'D83DDC4F', 'D83DDC4A', '270B', 'D83DDE4F', 'D83DDC43', 'D83DDC46', 'D83DDC47']
      // }),
      // emojies = kemoji[0];


  ws.onopen = function (event) {
    indicator.classList.add('success');
    indicator.classList.remove('error');
    sysmes.innerHTML = 'Соединение установлено';

  };

  ws.onclose = function (event) {
    indicator.classList.add('error');
    indicator.classList.remove('success');

    if (event.wasClean) {
      sysmes.innerHTML = 'Соединение закрыто: <br>';
    } else {
      sysmes.innerHTML = 'Соединения как-то закрыто <br>';
    }
    // TODO: Нужно ли перенести в условие?
    sysmes.innerHTML += `<i>код: ${event.code} причина: ${event.reason}</i>`;
  };

  ws.onmessage = function (event) {
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
        forms['message'].style.display = 'grid';
        chat.style.display = 'block';
        break;

      case 'signup':
        user = message.user;
        signin.classList.add('d-n');
        signup.classList.add('d-n');
        signin.classList.remove('flex');
        signup.classList.remove('flex');
        forms['message'].style.display = 'grid';
        chat.style.display = 'block';
        break;

      case 'allmsg':
        message.messages.map((msg) => addMessage(msg))
        break;

      default:
        // Что-то

    }
  };

  ws.onerror = function (event) {
    indicator.classList.add('error');
    indicator.classList.remove('success');
    sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
  };
  // forms['message'].onclick = () => {
  //   emojies.setWidth(300); //ширина тектового поля
  //   emojies.setHeight(58); //высота
  //
  //   emojies.setSmileContainerWidth(100);
  //   emojies.setSmileContainerHeight(100)
  //
  //   emojies.focus();
  //   emojies.showSmiles();
  //
  // }
  forms['message'].onsubmit = function () {
    if (this.text.value.trim() !== '' &&
        user.name !== undefined) {
      let message = {
        type: 'msg',
        user: user,
        text: this.text.value.trim()
      };
      console.log(emojies.getValue());
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
        this.password.value.trim() !== '') {
      let message = {
        type: 'signup',
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

  }
  document.querySelector('#themeSwitch').onclick = () => {
    document.body.classList.toggle('white');
    document.body.classList.toggle('black');
  }
  settings.onclick = () => {
    flagSettings = !flagSettings;
    if(flagSettings) {
      document.querySelector('.settings').style.display = '';
      document.querySelector('.settings').focus();
    }
    else {
      document.querySelector('.settings').style.display = 'none';
    }
  }
}
function addMessage (message) {
  console.log(chat)
  let children = chat.children;
  message.date = new Date(message.date).toLocaleTimeString().substring(0,5);
  if (children.length > 0) {
    let lastChild = children[children.length - 1];

    if (lastChild.children[0].innerText === message.user.name) {
      lastChild.children[1].innerHTML += `
          <article class='message flex ai-c grid gap-15'>
            <i>${message.date}</i>
            <span>${message.text}</span>
          </article>`;
    } else {
      chat.innerHTML += `
          <article class='user_message mymsgs'>
            <p class='m'>${message.user.name}</p>
            <section class='items grid gap'>
              <article class='message flex ai-c grid gap-15'>
                <i>${message.date}</i>
                <span>${message.text}</span>
              </article>
            </section>
          </article>`;
    }
  } else {
    chat.innerHTML += `
        <article class='user_message mymsgs'>
          <p class='m'>${message.user.name}</p>
          <section class='items grid gap'>
            <article class='message flex ai-c grid gap-15'>
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

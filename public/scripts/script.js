let HOST = location.origin.replace(/^http/, 'ws');
    ws = new WebSocket(HOST),
    chat = document.querySelector("#chat"),
    condition = document.querySelector("#condition"),
    indicator = document.querySelector("#indicator"),
    sysmes = document.querySelector("#sysmes"),
    forms = document.forms;
    user = "",
    users = [{ // Временно
        login: "user1",
        password: "111"
      }, {
        login: "user2",
        password: "222"
      }, {
        login: "user3",
        password: "333"
      }, {
        login: "user4",
        password: "444"
    }];
ws.onopen = function() {
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
  let message = JSON.parse(event.data),
  children = chat.children;

  if (children.length > 0) {
    lastChild = children[children.length - 1]
    if (lastChild.children[0].innerText == message.user) {
      lastChild.children[1].innerHTML += `
          <article class="message flex ai-c grid gap-15">
            <i>${message.date}</i>
            <span>${message.text}</span>
          </article>`;
    } else {
      chat.innerHTML += `
          <article class="user_message mymsgs">
            <p class="m">${message.user}</p>
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
          <p class="m">${message.user}</p>
          <section class="items grid gap">
            <article class="message flex ai-c grid gap-15">
              <i>${message.date}</i>
              <span>${message.text}</span>
            </article>
          </section>
        </article>`;
  }
  chat.scrollTop = chat.scrollHeight;
};

ws.onerror = function(event) {
  indicator.classList.add("error");
  indicator.classList.remove("success");
  sysmes.innerHTML = `<b>Система:</b>ошибка ${event.message}`;
};

forms["message"].onsubmit = function() {
  console.log("a" + this.text.value.trim() + "a")
  if (this.text.value != "" && this.text.value.trim() != ""){
    let message = {
      user: user,
      text: this.text.value,
      date: new Date().toLocaleTimeString().substring(0, 5)
    };
    this.text.value = "";
    ws.send(JSON.stringify(message));

  } else {
    this.text.focus();
  }
  return false;
}

forms["signin"].onsubmit = function () {
  if (this.login.value != "" && this.password.value != "") {
    for (i = 0; i < users.length; i++) {
      if (this.login.value == users[i].login &&
          this.password.value == users[i].password) {
        user = this.login.value;
        // forms["message"].querySelector("#user_name").innerHTML = `<b>${user}</b>`;
        this.style.display = "none";
        forms["message"].style.display = "grid";
        chat.style.display = 'block';
        break;
      }
    }
    if (!user) {
      alert("Вы не смогли авторизироваться");
    }
  }
  return false;
}

document.querySelector("#themeSwitch").onclick = () => {
  document.body.classList.toggle("white");
  document.body.classList.toggle("black");
}

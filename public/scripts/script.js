let HOST = "ws://localhost:3000";//location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(HOST),
    chat = document.querySelector("#chat"),
    user = "",
    users = [
      {
      login: "admin",
      password: "111"
      },
      {
      login: "user",
      password: "123"
      },
      {
      login: "user1",
      password: "444"
      },
      {
      login: "arara",
      password: "123"
      }
    ];
ws.onopen = function() {
  chat.innerHTML += `<article class="grid grid-col-3 gap"><b>Система:</b><span>cоединение установлено</span><i>${new Date().toLocaleTimeString().substring(0,5)}</i></article>`;
};

ws.onclose = function(event) {
  if (event.wasClean) {
    chat.innerHTML += `<article class="grid grid-col-3 gap"><b>Система:</b><span>cоединение закрыто</span><i>${new Date().toLocaleTimeString().substring(0,5)}</i></article>`;
  } else {
    chat.innerHTML += `<article class="grid grid-col-3 gap"><b>Система:</b><span>соединения как-то закрыто</span><i>${new Date().toLocaleTimeString().substring(0,5)}</i></article>`;
  }
  chat.innerHTML += `<article class="grid grid-col-3 gap"><b>Система:</b><span>код: ${event.code} причина: ${event.reason}</span><i>${new Date().toLocaleTimeString().substring(0,5)}</i></article>`;
};

ws.onmessage = function(event) {
  let message = JSON.parse(event.data);
  chat.innerHTML += `<article class="grid grid-col-3 gap"><b>${message.user}:</b><span>${message.text}</span><i>${message.date}</i></article>`;
  document.getElementById("chat").scrollTop =   document.getElementById("chat").scrollHeight;
};

ws.onerror = function(event) {
  chat.innerHTML += `<article class="grid grid-col-3 gap"><b>Система:</b><span>ошибка ${event.message}</span><i>${new Date().toLocaleTimeString().substring(0,5)}</i></article>`;
};

document.forms["message"].onsubmit = function() {
  if (this.text.value != "" && this.user.value != ""){
    let message = {
          user: user,
          text: this.text.value,
          date: new Date().toLocaleTimeString().substring(0,5)
        };
        this.text.value = "";
    ws.send(JSON.stringify(message));

  }
  else {
    this.text.focus();

  }
     return false;
}
document.forms["signin"].onsubmit = function () {
  if (this.login.value != "" && this.password.value != "") {
    for (i = 0; i < users.length;i++) {
      if (this.login.value == users[i].login && this.password.value == users[i].password) {
        alert("Смог" + i);
        user = this.login.value;
        this.style.display = "none";
        document.forms["message"].style.display = "grid";
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

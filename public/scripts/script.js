let HOST = "ws://localhost:3000";//location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(HOST),
    chat = document.querySelector("#chat"),
    condition = document.querySelector("#condition"),
    user = "",
    users = [
      {
      login: "user1",
      password: "111"
      },
      {
      login: "user2",
      password: "222"
      },
      {
      login: "user3",
      password: "333"
      },
      {
      login: "user4",
      password: "444"
      }
    ];
ws.onopen = function() {
  condition.querySelector("#indicator").classList.add("success");
  condition.querySelector("#indicator").classList.remove("error");
  condition.querySelector("#sysmes").innerHTML = "Соединение установлено";
};

ws.onclose = function(event) {
  condition.querySelector("#indicator").classList.add("error");
  condition.querySelector("#indicator").classList.remove("success");

  if (event.wasClean) {
      condition.querySelector("#sysmes").innerHTML = "Соединение закрыто: <br>";
  } else {
      condition.querySelector("#sysmes").innerHTML = "Соединения как-то закрыто <br>";
  }
    condition.querySelector("#sysmes").innerHTML += `<i>код: ${event.code} причина: ${event.reason}</i>`;
};

ws.onmessage = function(event) {
  let message = JSON.parse(event.data),
  children = chat.children;

  if(children.length > 0) {
    lastChild = children[(children.length - 1)]
    if(lastChild.children[0].innerText == message.user) {
        lastChild.children[1].innerHTML += `<article class="message grid gap-15"> <i>${message.date}</i><span>${message.text}<span></article>`;
      } else{
        chat.innerHTML += `<article class="user_message mymsgs"><p>${message.user}</p><article class="items grid gap"><article class="message grid gap-15"> <i>${message.date}</i><span>${message.text}</article></article>`;
      }
  } else {
    chat.innerHTML += `<article class="user_message mymsgs"><p>${message.user}</p><article class="items grid gap"><article class="message grid gap-15"> <i>${message.date}</i><span>${message.text}</article></article>`;
  }

  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
};

ws.onerror = function(event) {
  condition.querySelector("#indicator").classList.add("error");
  condition.querySelector("#indicator").classList.remove("success");
  condition.querySelector("#indicator").innerHTML = `<b>Система:</b>ошибка ${event.message}`;
};

document.forms["message"].onsubmit = function() {
  if (this.text.value != ""){
    let message = {
          user: user,
          text: this.text.value,
          date: new Date().toLocaleTimeString().substring(0,5)
        };
        this.text.value = "";
    ws.send(JSON.stringify(message));

  } else {
    this.text.focus();

  }
     return false;
}

document.forms["signin"].onsubmit = function () {
  if (this.login.value != "" && this.password.value != "") {
    for (i = 0; i < users.length; i++) {
      if (this.login.value == users[i].login && this.password.value == users[i].password) {
        user = this.login.value;
        document.forms["message"].querySelector("#user_name").innerHTML = `<b>${user}</b>`;
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

document.querySelector("#themeSwitch").onclick = () => {
  document.body.classList.toggle("white");
  document.body.classList.toggle("black");
}


class BuilderClass {
    #currentChat = null;
    #chatList =  null;
    #container = null;
    chatListContainer = document.querySelector('#chatsList');
    #ws = null;
    #user = {};
    chatinfo = null;

    constructor(ws) {
        this.prevdate = null;
    }

    createMessage(data) {
        let container = this.container,
            children = container.children,
            datemsg = this.translateDate(data.date),
            date = new Date(data.date),
            text = censored.checked ? data.text.split(" ").map(word => badWords.includes(word.toLowerCase()) ? '*'.repeat(word.length) : word).join(" ") : data.text;
        if (children.length > 0) {
            let lastChild = children[children.length - 1];
            if (this.prevdate !== date.getDate()) {
                this.prevdate = date.getDate();
                container.innerHTML += `
          <div class="relative sprdate flex center"> 
            <hr class="absolute">
            <p class="">${date.getDate()} ${date.toLocaleTimeString("default", {month: "short"}).split(',')[0]}</p>
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

    createStartView() {
        if (this.chat === null) {
            let chat = document.getElementById("chat");
            chat.classList.add("center");
            // fetch('views/temlates/test.html')
            //     .then(response=> response.text())
            //     .then(text=> console.log(text));
            // var xmlhttp = new XMLHttpRequest();
            // xmlhttp.open("GET", "views/temlates/test.html", false);
            // xmlhttp.send();
            // console.log(xmlhttp)
            // chat.innerHTML = xmlhttp.responseText;

        } else {
            this.createChat(this.chat);
        }

    }

    createChat(data) {
        if (this.chat === data) {
            console.log(data);
        } else {
            if (sessionStorage.getItem(this.chat)) {
                let messages = sessionStorage.getItem(this.chat);
                messages.map(x => this.createMessage(chat))
            }
            let res = {
                type: "getChatMessages",
                data: {
                    chat: data,
                    user: this.user.name
                }
            }
            this.ws.send(JSON.stringify(res));
            this.currentChat = data;
            let chat = document.getElementById("chat");
            chat.classList.remove("center");
            while (chat.firstChild) {
                chat.removeChild(chat.firstChild);
            }
        }
        this.chatList.map(x => {
            if (x.chat === this.chat) {
                this.chatinfo.name = x.name;
                this.chatinfo.owner = x.owner;
            }
        })
        return 0;
    }

    translateDate(date) {
        return new Date(date).toLocaleTimeString().substring(0, 5)
    }

    renderChats(chats) {
        this.chatList = chats;
        chats.map(x => {
            let chat = document.createElement('article');
            chat.dataset.id = x.chat;
            chat.innerHTML = `
            <p class="bold">${x.name}</p>
            <p class="grid grid-a-1-a gap-5"><i>${x.lastmessage}:</i> <span> ${x.text.substring(0, 15)} </span><i>${this.translateDate(x.date)}</i></p>`
            chat.addEventListener("click", () => {
                this.createChat(x.chat);
            })
            this.chatListContainer.append(chat);
        })
    }
    authFormSwitch() {
        let signin = document.querySelector('article.signin'),
            signup = document.querySelector('article.signup');

        signin.classList.toggle('flex');
        signin.classList.toggle('d-n');
        signup.classList.toggle('flex');
        signup.classList.toggle('d-n');
    }

    createForms() {

    }

    createSettings() {

    }

    get ws() {
        return this.#ws;
    }

    set ws(data) {
        this.#ws = data;
    }

    set currentChat(data) {
        this.#currentChat = data;
    }

    get chat() {
        return this.#currentChat;
    }

    get user() {
        return this.#user;
    }

    set user(data) {
        if (data !== null) {
            console.log(data);
            this.#user = data;
        }
    }

    set container(data) {
        if (data) {
            this.#container = data;
        }
    }

    get container() {
        return this.#container;
    }
    set chatList(data) {
        if(data) {
            this.#chatList = data;
        }
    }
    get  chatList() {
        return this.#chatList;
    }
}








export default BuilderClass;
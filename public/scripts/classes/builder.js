class BuilderClass {
    #currentChat = null;
    #chatList =  null;
    #container = null;
    chatListContainer = document.querySelector('#chatsList');
    #ws = null;
    #user = {};

    constructor(ws) {
        this.prevdate = null;
    }

    createMessage(data) {

        let container = this.container,
            children = container.children,
            datemsg = this.translateDate(data.date),
            date = new Date(data.date),
            blockDate = '',
            node = '',
            blockMessage = '',
            text = censored.checked ? data.text.split(" ").map(word => badWords.includes(word.toLowerCase()) ? '*'.repeat(word.length) : word).join(" ") : data.text;
        if(container.querySelector('p.center')) {
            container.removeChild(container.querySelector('p.center'));
        }
        if (children.length > 0) {
            let lastChild = children[children.length - 1];
            if (this.prevdate !== date.getDate() || this.prevdate == null) {
                this.prevdate = date.getDate();
                blockDate = `
          <div class="relative sprdate flex center"> 
            <hr class="absolute">
            <p class="">${date.getDate()} ${date.toLocaleTimeString("default", {month: "short"}).split(',')[0]}</p>
          </div>
        `;
            }
            if (lastChild.children[0].innerText === data.user.name) {
                node = lastChild.children[1];
                blockMessage = `
          <article class='message flex ai-c grid gap-15'>
            <i>${datemsg}</i>
            <span>${text}</span>
          </article>`;
            } else {
                node = container;
                blockMessage = `
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
            node = container;
            blockMessage = `
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
        node.innerHTML += blockDate;
        node.innerHTML += blockMessage;
        container.scrollTop = container.scrollHeight;
    }

    createChat(data) {
        if (this.chat === data) {
            window.App.data.chats.chatInfo.currentChat = data;
        } else {
            window.App.data.chats.chatInfo.currentChat = data;
            if (sessionStorage.getItem(this.chat)) {
                let messages = sessionStorage.getItem(this.chat);
                messages.map(x => this.createMessage(chat))
            }
            buttonInfo.classList.remove('d-n');
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
                window.App.data.chats.chatInfo.name = x.name;
                window.App.data.chats.chatInfo.owner = x.owner;
            }
        })
        return 0;
    }

    translateDate(date) {
        return new Date(date).toLocaleTimeString().substring(0, 5)
    }

    renderChats(chats) {
        this.chatList = chats;
        if(this.chatListContainer.querySelector('#no-chats')) {
            this.chatListContainer.removeChild(this.chatListContainer.querySelector('#no-chats'));
        }
        while(this.chatListContainer.children.length > 2) {
            this.chatListContainer.removeChild(this.chatListContainer.lastChild);
        }
        if(chats.length > 0) {
            chats.map(x => {
                let chat = document.createElement('article');
                chat.dataset.id = x.chat;
                chat.classList.add('chat')
                chat.innerHTML = `
            <p class="bold center">${x.name}</p>`
                chat.addEventListener("click", () => {
                    this.createChat(x.chat);
                })
                this.chatListContainer.append(chat);
            })
        }
        else {
            let chat = `<p class="center"">У вас  нет чатов</p>`
            this.chatListContainer.append(chat)
        }

    }
    authFormSwitch() {
        let signin = document.querySelector('article.signin'),
            signup = document.querySelector('article.signup');

        signin.classList.toggle('flex');
        signin.classList.toggle('d-n');
        signup.classList.toggle('flex');
        signup.classList.toggle('d-n');
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
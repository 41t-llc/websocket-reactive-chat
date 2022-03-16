class chatInfo {
    #name
    #owner
    constructor() {

    }
    get name() {
        return this.#name;
    }
    set name(value) {
        this.#name = value
        document.getElementById("chat_name").innerText = value;
    }
    set owner(value) {
        document.getElementById("chat_owner").innerText = value;
        this.#owner = value
    }
    get owner() {
        return this.#owner;
    }

}
export default chatInfo;
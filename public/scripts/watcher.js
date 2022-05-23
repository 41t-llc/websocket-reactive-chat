function Watcher(dataObj) {
    let signals = {},
        structures = [];

    observeData(dataObj)

    return Object.create(dataObj, observe, notify)

    function observe(property, signalHandler) {
        if (!signals[property]) signals[property] = []

        signals[property].push(signalHandler)
    }

    function notify(signal) {
        if (!signals[signal] || signals[signal].length < 1) return

        signals[signal].forEach((signalHandler) => {
            signalHandler()
        })

    }

    function makeReactive(obj, key) {
        let val = obj[key]
        let structure;
        Object.defineProperty(obj, key, {
            get() {
                return val
            },
            set(newVal) {
                val = newVal
                notify(key)
            }
        })
    }

    function observeData(obj) {


        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {

                if (typeof (obj[key]) !== 'object' || Array.isArray(obj[key])) {

                    makeReactive(obj, key);
                } else {
                    console.log(obj[key])
                    makeReactive(obj, key);
                    observeData(obj[key]);
                }

            }
        }
    }

    function syncNode(node, observable, property) {
        node.textContent = observable[property]
        observe(property, () => node.textContent = observable[property])
    }

    function syncNodeArray(node, observable, property, number) {

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        console.log("I delete all child")

        observable[property].forEach((dataEl, index) => {

            let newBlock = structures[property + number].cloneNode(true);
            console.log(newBlock.children)
            for (let key = 0; key < newBlock.children.length; key++) {
                let child = newBlock.children[key];

                if (child.hasAttribute('data-model')) {

                    let attr = child.getAttribute('data-model');
                    child.textContent = dataEl[attr];
                }
                console.log(child)
                node.appendChild(child);
            }


        })


        observe(property, () => {
            console.log("test")
        })

        // observe(property, () => node.textContent = observable[property])
    }

    // function copyDOM(collection) {
    //     const newObjectDOM = {};
    //
    //     for(let key = 0; key < collection.length; key++) {
    //         newObjectDOM[key] = collection[key];
    //     }
    //     return newObjectDOM;
    // }
    // function copyObject(obj) {
    //     const newObject = {};
    //
    //
    //     for(let key in obj) {
    //         newObject[key] = obj[key];
    //     }
    //     return newObject;
    // }

    function parseDOM(node, observable) {

        const nodes = document.querySelectorAll('[data-model]')
        const Arraynodes = document.querySelectorAll('[data-for]')

        Arraynodes.forEach(nodes => {
            syncNodeArray(nodes,observable,nodes.getAttribute('data-for'))
            })
        nodes.forEach((node) => {
            syncNode(node, observable, node.attributes['data-model'].value)

        })

        // Arraynodes.forEach((node) => {
        //     syncNodeArray(node, observable, node.attributes['data-for'].value)
        //
        // })
    }
}

export default Watcher
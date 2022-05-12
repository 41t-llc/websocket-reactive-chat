function Watcher (dataObj) {
    let signals = {};
    observeData(dataObj)

    return Object.create(dataObj,observe,notify)

    function observe (property, signalHandler) {
        if(!signals[property]) signals[property] = []

        signals[property].push(signalHandler)
    }

    function notify (signal) {
        if(!signals[signal] || signals[signal].length < 1) return

        signals[signal].forEach((signalHandler) => {
            signalHandler()})

    }

    function makeReactive (obj, key) {
        let val = obj[key]
        let structure;
        Object.defineProperty(obj, key, {
            get () {
                return val
            },
            set (newVal) {
                val = newVal
                notify(key)
                if(Array.isArray(obj[key])) syncNodeArray(document.querySelectorAll(`[v-for=${key}]`),obj,key)
                parseDOM(document.body,obj);
            }
        })
    }

    function observeData (obj) {


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

    function syncNode (node, observable, property) {
        node.textContent = observable[property]
        observe(property, () => node.textContent = observable[property])
    }
    function syncNodeArray (node, observable, property) {

        node.forEach(el => {
            const block =  el.cloneNode(true);
            block.removeAttribute('v-for');
                console.log(block)
                observable[property].forEach(dataEl => {
                    let newBlock = block.cloneNode(true);

                    for(let key in dataEl) {
                        // console.log(dataEl)
                        console.log(newBlock.querySelectorAll(`[v-model = ${key}]`))
                        newBlock.querySelectorAll(`[v-model = ${key}]`).forEach((x) => {
                            observe(key, () => x.textContent = dataEl[key])
                            x.textContent += dataEl[key];

                        }) ;
                        
                        el.append(newBlock);

                    }
                })


        })


    }

    function parseDOM (node, observable) {

        const nodes = document.querySelectorAll('[v-model]')
        const Arraynodes = document.querySelectorAll('[v-for]')
        nodes.forEach((node) => {
            syncNode(node, observable, node.attributes['v-model'].value)

        })
        // Arraynodes.forEach((node) => {
        //     syncNodeArray(node, observable, node.attributes['v-for'].value)
        //
        // })
    }
}
export default Watcher
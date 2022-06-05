export default function Watcher(config) {
    class ObservableArray extends Array {
        constructor(args, path) {
            super(...args)
            this.__proto__.path = path
        }

        push(...args) {
            super.push(...args)
            notify(this.__proto__.path)
        }

        fill(...args) {
            super.fill(...args)
            notify(this.__proto__.path)
        }

        sort(...args) {
            super.sort(...args)
            notify(this.__proto__.path)
        }

        unshift(...args) {
            super.unshift(...args)
            notify(this.__proto__.path)
        }

        reverse() {
            super.reverse()
            notify(this.__proto__.path)
        }

        shift() {
            super.shift()
            notify(this.__proto__.path)
        }

        pop() {
            super.pop()
            notify(this.__proto__.path)
        }

        splice(...args) {
            super.splice(...args)
            notify(this.__proto__.path)
        }
    }

    let signals = {},
        structures = [];

    let Dep = {
        target: null,
        subs: {},
        depend(deps, dep) {
            if (!deps.includes(this.target)) {
                deps.push(this.target)
            }
            if (!Dep.subs[this.target].includes(dep)) {
                Dep.subs[this.target].push(dep)
            }
        },
        getValidDeps(deps, key) {
            return deps.filter(dep => this.subs[dep].includes(key))
        },
        notifyDeps(deps) {
            deps.forEach(notify)
        }
    }

    observeData(config.data)

    return {
        data: config.data,
        observe,
        notify
    }

    function observe(property, signalHandler) {
        if (!signals[property]) signals[property] = []

        signals[property].push(signalHandler)
    }

    function notify(signal) {
        if (!signals[signal] || signals[signal].length < 1) return

        signals[signal].forEach(signalHandler => signalHandler())
    }

    function makeReactive(obj, key, prefix, isArray) {
        let deps = []
        const path = prefix.concat([key]).join('.')

        let val = isArray
            ? new ObservableArray(obj[key], path)
            : obj[key]

        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    Dep.depend(deps, key)
                }

                return val
            },
            set(newVal) {
                val = isArray
                    ? new ObservableArray(newVal, path)
                    : newVal

                deps = Dep.getValidDeps(deps, key)
                Dep.notifyDeps(deps, key)

                notify(path)
            }
        })
    }

    function makeComputed(obj, key, computeFunc) {
        let cache = null
        let deps = []


        observe(key, () => {

            cache = null

            deps = Dep.getValidDeps(deps, key)
            Dep.notifyDeps(deps, key)
        })

        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    Dep.depend(deps, key)
                }

                Dep.target = key

                if (!cache) {
                    Dep.subs[key] = []
                    cache = computeFunc.call(obj)
                }

                Dep.target = null
                return cache
            },
            set() {

            }
        })
    }

    function observeData(obj) {
        walk(obj)
        parseDOM(document.body, obj)
    }

    function walk(obj, prefix = []) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'function') {
                    makeComputed(obj, key, obj[key])
                } else {
                    if (Array.isArray(obj[key])) {
                        makeReactive(obj, key, prefix, true)
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        walk(obj[key], prefix.concat(key))
                    } else {
                        makeReactive(obj, key, prefix)
                    }
                }
            }
        }
    }

    function sync (attr, node, observable, property) {
        if(attr === 'append') {
            node.append(observable[property]);
        }
        else {
            if(Array.isArray(get(observable, property))) {
                structures[property] = node.cloneNode(true);
                let data;
                clearNode(node)
                data = get(observable,structures[property].getAttribute('data-block'))
                data.forEach((item, i) => {

                    let newBlock = structures[property].cloneNode(true);
                    for(let key = 0; key < structures[property].children.length; key++) {

                        let child = newBlock.children[key].cloneNode(true);

                        if(child.hasAttribute('data-item')) {
                            child[attr] = item[child.getAttribute('data-item')];

                        }

                        node.appendChild(child)
                    }
                });
            }
            else {
                node[attr] = get(observable, property)
            }

        }

        observe(property, () => {
            if(attr === 'append') {
                clearNode(node);
                node.append(observable[property]);
            }
            else {
                if(Array.isArray(get(observable, property))) {
                    structures[property] = node.cloneNode(true);
                    let data;
                    clearNode(node);

                    data = get(observable,structures[property].getAttribute('data-block'))
                    data.forEach((item, i) => {

                        let newBlock = structures[property].cloneNode(true);
                        for(let key = 0; key < structures[property].children.length; key++) {

                            let child = newBlock.children[key].cloneNode(true);

                            if(child.hasAttribute('data-item')) {
                                child[attr] = item[child.getAttribute('data-item')];

                            }

                            node.appendChild(child)
                        }
                    });
                }
                else {
                    node[attr] = get(observable, property)
                }
            }
        })
    }

    function clearNode(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    function getPathKeys(path) {
        return path
            .replace(/\[(\w+)\]/g, '.$1')
            .replace(/^\./, '')
            .split('.')
    }

    function get(obj, path) {
        return getPathKeys(path)
            .reduce((prev, curr) => {
                return prev ? prev[curr] : undefined
            }, obj)
    }

    function parseDOM(node, observable) {
        const nodes = document.querySelectorAll('[data-text]')
        const blocks = document.querySelectorAll('[data-block]')
        const blocksAppend = document.querySelectorAll('[data-block-append]')
        const inputs = document.querySelectorAll('[s-model]')
        
        nodes.forEach(node => {
            structures[node.getAttribute('data-text')] = node.cloneNode(true);
                sync('textContent', node, observable, node.attributes['data-text'].value)
        })
        
        blocks.forEach(node => {
            sync('innerHTML', node, observable, node.attributes['data-block'].value)
        })
        
        blocksAppend.forEach(node => {
            sync('append', node, observable, node.attributes['data-block-append'].value)
        })

        inputs.forEach(input => {
            const property = input.attributes['s-model'].value
            sync('value', input, observable, property)
            input.addEventListener('input', e => {
                set(observable, property, e.target.value)
            })
        })

    }
}

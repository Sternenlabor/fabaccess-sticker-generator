export default class EventTarget {
    #listeners = {}

    addEventListener(event, callback) {
        if (!this.#listeners[event]) {
            this.#listeners[event] = []
        }
        this.#listeners[event].push(callback)
    }

    removeEventListener(event, callback) {
        if (!this.#listeners[event]) {
            return
        }
        const callbackIndex = this.#listeners[event].indexOf(callback)
        if (callbackIndex > -1) {
            this.#listeners[event].splice(callbackIndex, 1)
        }
    }

    dispatchEvent(event) {
        if (!this.#listeners[event.type]) {
            return
        }
        this.#listeners[event.type].forEach((callback) => {
            callback(event)
        })
    }
}

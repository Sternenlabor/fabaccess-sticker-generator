// Implementation of a custom EventTarget class to manage event listeners and dispatch events
export default class EventTarget {
    #listeners = {} // Private property to store event listeners

    /**
     * Adds an event listener for a specific event type.
     * @param {string} event - The event type to listen for.
     * @param {Function} callback - The callback function to be called when the event is dispatched.
     */
    addEventListener(event, callback) {
        // Initialize the listeners array for the event if it doesn't exist
        if (!this.#listeners[event]) {
            this.#listeners[event] = []
        }
        // Add the callback to the listeners array for the event
        this.#listeners[event].push(callback)
    }

    /**
     * Removes an event listener for a specific event type.
     * @param {string} event - The event type for which the listener should be removed.
     * @param {Function} callback - The callback function to remove from the listeners.
     */
    removeEventListener(event, callback) {
        // If there are no listeners for the event, exit the method
        if (!this.#listeners[event]) {
            return
        }
        // Find the index of the callback in the listeners array
        const callbackIndex = this.#listeners[event].indexOf(callback)
        // If the callback exists, remove it from the array
        if (callbackIndex > -1) {
            this.#listeners[event].splice(callbackIndex, 1)
        }
    }

    /**
     * Dispatches an event to all registered listeners of the event's type.
     * @param {Object} event - The event object to dispatch. Should have a 'type' property.
     */
    dispatchEvent(event) {
        // If there are no listeners for the event type, exit the method
        if (!this.#listeners[event.type]) {
            return
        }
        // Call each listener's callback function with the event object
        this.#listeners[event.type].forEach((callback) => {
            callback(event)
        })
    }
}

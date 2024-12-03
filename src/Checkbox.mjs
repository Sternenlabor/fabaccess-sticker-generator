// Create a template element to define the structure of the custom checkbox component
const template = document.createElement('template')
template.innerHTML = /* html */ `
    <style> @import url("/src/Checkbox.css"); </style>
    <label class="checkbox">
        <input type="checkbox" id="checkbox" />
        <span class="checkmark"></span>
        <slot></slot>
    </label>`

// Define a custom Checkbox class that extends HTMLElement
class Checkbox extends HTMLElement {
    #root = null // Private property to store the root node

    /**
     * Creates an instance of Checkbox and initializes the shadow DOM.
     */
    constructor() {
        super() // Call the parent class constructor

        // Attach a shadow DOM tree to this element
        this.attachShadow({ mode: 'open' })

        // Append the cloned template content to the shadow root
        this.shadowRoot.append(template.content.cloneNode(true))

        // Get the root node of the shadow DOM
        this.#root = this.shadowRoot.getRootNode()

        // Get the checkbox input element from the shadow DOM
        const checkbox = this.#root.getElementById('checkbox')

        // Add an event listener for the 'change' event on the checkbox
        checkbox.addEventListener('change', this.#handleChange.bind(this), {
            passive: false
        })
    }

    /**
     * Handles the 'change' event of the checkbox input.
     * @param {Event} e - The event object.
     * @private
     */
    #handleChange(e) {
        const val = e.target.checked // Get the checked state of the checkbox

        // Dispatch a custom 'change' event from the custom element
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    checked: val // Include the checked state in the event detail
                },
                composed: true // Allow the event to bubble up through the shadow DOM boundary
            })
        )
    }
}

// Define the custom element 'fabaccess-checkbox' associated with the Checkbox class
customElements.define('fabaccess-checkbox', Checkbox)

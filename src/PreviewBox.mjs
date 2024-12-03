import SVGRenderer from '/src/SVGRenderer.mjs'

// Create a template element to define the structure of the preview box component
const template = document.createElement('template')
template.innerHTML = /* html */ `
    <style> @import url("/src/PreviewBox.css"); </style>
    <div id="box"></div>`

// Define a custom PreviewBox class that extends HTMLElement
class PreviewBox extends HTMLElement {
    value = '' // The value to be encoded in the QR code
    size = 0 // The size of the QR code

    #root = null // Private property to store the root node
    #box = null // Private property to store the box element
    #animationId = 0 // Private property for requestAnimationFrame

    /**
     * Creates an instance of PreviewBox and initializes the component.
     */
    constructor() {
        super() // Call the parent class constructor

        // Attach a shadow DOM tree to this element
        this.attachShadow({ mode: 'open' })
        // Append the cloned template content to the shadow root
        this.shadowRoot.append(template.content.cloneNode(true))

        // Get the root node of the shadow DOM
        this.#root = this.shadowRoot.getRootNode()
        // Get the box element from the shadow DOM
        this.#box = this.#root.getElementById('box')

        // Initialize value and size from attributes
        this.value = this.getAttribute('value') || ''
        this.size = parseFloat(this.getAttribute('size'))
    }

    /**
     * Observed attributes for the custom element.
     * @returns {Array<string>} - The list of attributes to observe.
     */
    static get observedAttributes() {
        return ['value', 'size']
    }

    /**
     * Called when one of the observed attributes changes.
     * @param {string} name - The name of the attribute that changed.
     * @param {string} oldValue - The old value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue != oldValue) {
            switch (name) {
                case 'value':
                    this[name] = newValue // Update the value property
                    break
                case 'size':
                    this[name] = parseFloat(newValue) // Update the size property
                    break
            }

            this.#render() // Re-render the QR code
        }
    }

    /**
     * Public method to update the QR code rendering.
     */
    update() {
        this.#render()
    }

    /**
     * Clears the content of the box element.
     * @private
     */
    #clear() {
        while (this.#box.firstChild) {
            this.#box.removeChild(this.#box.firstChild)
        }
    }

    /**
     * Renders the QR code inside the box element.
     * @private
     */
    #render() {
        // Cancel any pending animation frame
        window.cancelAnimationFrame(this.#animationId)
        // Schedule the rendering in the next animation frame
        this.#animationId = window.requestAnimationFrame(() => {
            this.#clear() // Clear existing content
            const time = new Date()

            // Generate the QR code SVG and insert it into the box
            this.#box.innerHTML = SVGRenderer.getCode(this.value, `${this.size}mm`)

            console.log('QRCode generation time: ' + (new Date() - time) + ' ms')
        })
    }
}

// Define the custom element 'fabaccess-preview-box' associated with the PreviewBox class
customElements.define('fabaccess-preview-box', PreviewBox)

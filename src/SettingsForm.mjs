import SVGRenderer from '/src/SVGRenderer.mjs'
import {} from '/src/Checkbox.mjs'

// Create a template element to define the structure of the settings form component
const template = document.createElement('template')
template.innerHTML = /* html */ `
    <style> @import url("/src/SettingsForm.css"); </style>

    <div class="form-group group-1">
        <label for="machineID">Machine ID:</label>
        <input type="text" name="machineID" id="machineID" placeholder="Enter the machine ID" />
    </div>

    <div class="form-group group-2">
        <label for="size">QR Code Height:</label>
        <div class="select-wrapper">
            <select name="size" id="size">
                <option value="15">15 mm</option>
                <option value="25" selected>25 mm</option>
                <option value="40">40 mm</option>
                <option value="80">80 mm</option>
            </select>
        </div>
    </div>

    <!--
    <fabaccess-checkbox id="optimize-for-laser-printer" />Optimize Colors for Laser printing</fabaccess-checkbox>
    -->
    `
    

// Define a custom SettingsForm class that extends HTMLElement
class SettingsForm extends HTMLElement {
    machineID = '' // The machine ID entered by the user
    size = 25 // The selected size for the QR code
    optimizeForPrint = false // Whether to optimize colors for laser printing

    #root = null // Private property to store the root node

    /**
     * Creates an instance of SettingsForm and initializes the component.
     */
    constructor() {
        super() // Call the parent class constructor

        // Attach a shadow DOM tree to this element
        this.attachShadow({ mode: 'open' })
        // Append the cloned template content to the shadow root
        this.shadowRoot.append(template.content.cloneNode(true))

        // Get the root node of the shadow DOM
        this.#root = this.shadowRoot.getRootNode()

        // Initialize properties from attributes
        this.machineID = this.getAttribute('machineid') || ''
        this.size = parseFloat(this.getAttribute('size') || 25)
        this.optimizeForPrint = this.getAttribute('optimizeforprint') == 'true' || this.getAttribute('optimizeforprint') == '1'

        // Get form elements from the shadow DOM
        const machineIdInput = this.#root.getElementById('machineID')
        //const optimizeForPrintCheckbox = this.#root.getElementById('optimize-for-laser-printer')
        const sizeSelect = this.#root.getElementById('size')

        // Add event listener for input changes
        machineIdInput.addEventListener('keyup', this.#handleInputChange.bind(this), {
            passive: false
        })

        // Add event listener for size selection changes
        sizeSelect.addEventListener('change', this.#handleSelectChange.bind(this), {
            passive: false
        })

        // Add event listener for checkbox changes
        /*
        optimizeForPrintCheckbox.addEventListener('change', this.#handleCheckboxChange.bind(this), {
            passive: false
        })
        */

        // Set focus to the machine ID input after the element is rendered
        setTimeout(() => machineIdInput.focus(), 0)
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
                    this[name] = newValue
                    break
                case 'size':
                    this[name] = parseFloat(newValue)
                    break
            }
        }
    }

    /**
     * Handles input changes in the machine ID input field.
     * @param {Event} e - The event object.
     * @private
     */
    #handleInputChange(e) {
        e.stopPropagation()
        const val = e.target.value
        this.machineID = val

        // Dispatch a custom 'change' event with the updated values
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    machineID: this.machineID,
                    size: this.size,
                    optimizeForPrint: this.optimizeForPrint
                },
                composed: true
            })
        )
    }

    /**
     * Handles changes in the size select dropdown.
     * @param {Event} e - The event object.
     * @private
     */
    #handleSelectChange(e) {
        e.stopPropagation()
        const val = e.target.value
        this.size = parseInt(val, 10)

        // Dispatch a custom 'change' event with the updated values
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    machineID: this.machineID,
                    size: this.size,
                    optimizeForPrint: this.optimizeForPrint
                },
                composed: true
            })
        )
    }

    /**
     * Handles changes in the optimize for print checkbox.
     * @param {Event} e - The event object.
     * @private
     */
    /*
    #handleCheckboxChange(e) {
        e.stopPropagation()
        const val = e.detail.checked
        this.optimizeForPrint = val

        // Dispatch a custom 'change' event with the updated values
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    machineID: this.machineID,
                    size: this.size,
                    optimizeForPrint: this.optimizeForPrint
                },
                composed: true
            })
        )
    }
    */
}

// Define the custom element 'fabaccess-settings-form' associated with the SettingsForm class
customElements.define('fabaccess-settings-form', SettingsForm)

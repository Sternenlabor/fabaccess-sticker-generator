import SVGRenderer from '/src/SVGRenderer.mjs'
import {} from '/src/Checkbox.mjs'

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

        <fabaccess-checkbox id="optimize-for-laser-printer" />Optimize Colors for Laser printing</fabaccess-checkbox>`

class SettingsForm extends HTMLElement {
    machineID = ''
    size = 25
    optimizeForPrint = false

    #root = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.append(template.content.cloneNode(true))

        this.#root = this.shadowRoot.getRootNode()

        this.machineID = this.getAttribute('machineid') || ''
        this.size = parseFloat(this.getAttribute('size') || 25)
        this.optimizeForPrint = this.getAttribute('optimizeforprint') == 'true' || this.getAttribute('optimizeforprint') == '1'

        const machineIdInput = this.#root.getElementById('machineID')
        const optimizeForPrint = this.#root.getElementById('optimize-for-laser-printer')
        const size = this.#root.getElementById('size')

        machineIdInput.addEventListener('keyup', this.#handleInputChange.bind(this), {
            passive: false
        })

        size.addEventListener('change', this.#handleSelectChange.bind(this), {
            passive: false
        })

        optimizeForPrint.addEventListener('change', this.#handleCheckboxChange.bind(this), {
            passive: false
        })

        setTimeout(() => machineIdInput.focus(), 0)
    }

    static get observedAttributes() {
        return ['value', 'size']
    }

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

    #handleInputChange(e) {
        e.stopPropagation()
        const val = e.target.value
        this.machineID = val

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

    #handleSelectChange(e) {
        e.stopPropagation()
        const val = e.target.value
        this.size = parseInt(val, 10)

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

    #handleCheckboxChange(e) {
        e.stopPropagation()
        const val = e.detail.checked
        this.optimizeForPrint = val

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
}

customElements.define('fabaccess-settings-form', SettingsForm)

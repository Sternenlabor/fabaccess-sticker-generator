// Create a template element to define the structure of the color settings dialog
const template = document.createElement('template')
template.innerHTML = /* html */ `
    <style> @import url("/src/ColorSettings.css"); </style>
    <div id="dialog-overlay">
        <div id="dialog">
            <div class="color-field">
                <input type="color" id="sticker-background-color" name="sticker-background-color" />
                <label for="sticker-background-color">Sticker Background</label>
            </div>
            <div class="color-field">
                <input type="color" id="sticker-border-color" name="sticker-border-color" />
                <label for="sticker-border-color">Sticker Border</label>
            </div>
            <div class="color-field">
                <input type="color" id="icon-color" name="icon-color" />
                <label for="icon-color">Icon Color</label>
            </div>
            <div class="color-field">
                <input type="color" id="qr-code-background-color" name="qr-code-background-color" />
                <label for="qr-code-background-color">QR Code Background</label>
            </div>
            <div class="color-field">
                <input type="color" id="qr-code-foreground-color" name="qr-code-foreground-color" />
                <label for="qr-code-foreground-color">QR Code Foreground</label>
            </div>
            <div class="color-field">
                <input type="color" id="label-color" name="label-color" />
                <label for="label-color">Label Color</label>
            </div>
            <div id="dialog-buttons">
                <button id="save-button">Save</button>
                <button id="cancel-button">Cancel</button>
            </div>
        </div>
    </div>
`

// Define a custom ColorSettings class that extends HTMLElement
export default class ColorSettings extends HTMLElement {
    #root = null // Private property to store the root node

    /**
     * Creates an instance of ColorSettings and initializes the component.
     */
    constructor() {
        super()

        // Attach a shadow DOM tree to this element
        this.attachShadow({ mode: 'open' })
        // Append the cloned template content to the shadow root
        this.shadowRoot.append(template.content.cloneNode(true))

        // Get the root node of the shadow DOM
        this.#root = this.shadowRoot.getRootNode()

        // Get elements from the shadow DOM
        this.overlay = this.#root.getElementById('dialog-overlay')
        this.saveButton = this.#root.getElementById('save-button')
        this.cancelButton = this.#root.getElementById('cancel-button')

        // Color input fields
        this.stickerBackgroundColorInput = this.#root.getElementById('sticker-background-color')
        this.stickerBorderColorInput = this.#root.getElementById('sticker-border-color')
        this.iconColorInput = this.#root.getElementById('icon-color')
        this.qrCodeBackgroundColorInput = this.#root.getElementById('qr-code-background-color')
        this.qrCodeForegroundColorInput = this.#root.getElementById('qr-code-foreground-color')
        this.labelColorInput = this.#root.getElementById('label-color')

        // Load colors from localStorage or use default colors
        this.colors = ColorSettings.loadColors()

        // Set input values to current colors
        this.stickerBackgroundColorInput.value = this.colors['sticker-background-color']
        this.stickerBorderColorInput.value = this.colors['sticker-border-color']
        this.iconColorInput.value = this.colors['icon-color']
        this.qrCodeBackgroundColorInput.value = this.colors['qr-code-background-color']
        this.qrCodeForegroundColorInput.value = this.colors['qr-code-foreground-color']
        this.labelColorInput.value = this.colors['label-color']

        // Bind event listeners
        this.saveButton.addEventListener('click', this.#handleSave.bind(this))
        this.cancelButton.addEventListener('click', this.#handleCancel.bind(this))

        // Initially hide the dialog
        this.hide()
    }

    /**
     * Shows the color settings dialog.
     */
    show() {
        this.overlay.style.display = 'flex'
    }

    /**
     * Hides the color settings dialog.
     */
    hide() {
        this.overlay.style.display = 'none'
    }

    /**
     * Loads colors from localStorage or uses default colors.
     * @returns {Object} - An object containing the color settings.
     */
    static loadColors() {
        const colors = {}
        for (const key in ColorSettings.defaultColors) {
            colors[key] = localStorage.getItem(key) || ColorSettings.defaultColors[key]
        }
        return colors
    }

    /**
     * Saves the current colors to localStorage.
     */
    saveColors() {
        for (const key in this.colors) {
            localStorage.setItem(key, this.colors[key])
        }
    }

    /**
     * Applies stored colors to the document's root element.
     * This method retrieves colors from localStorage or uses default colors,
     * and sets them as CSS variables on the root element.
     */
    static applyStoredColors() {
        const colors = ColorSettings.loadColors()
        for (const key in colors) {
            document.documentElement.style.setProperty(`--${key}`, colors[key])
        }
    }

    /**
     * Returns the default color values.
     * @returns {Object} - An object containing the default color settings.
     */
    static get defaultColors() {
        const style = getComputedStyle(document.body)
        return {
            'sticker-background-color': style.getPropertyValue('--secondary-color'),
            'sticker-border-color': style.getPropertyValue('--primary-color'),
            'icon-color': style.getPropertyValue('--primary-color'),
            'qr-code-background-color': '#ffffff',
            'qr-code-foreground-color': style.getPropertyValue('--secondary-color'),
            'label-color': style.getPropertyValue('--primary-color')
        }
    }

    /**
     * Dispatches a custom event to notify that the colors have changed.
     * @private
     */
    #dispatchChangeEvent() {
        this.dispatchEvent(
            new CustomEvent('colors-changed', {
                detail: { colors: this.colors },
                composed: true
            })
        )
    }

    /**
     * Handles the save button click event.
     * Updates colors based on user input, saves them, and notifies listeners.
     * @private
     */
    #handleSave() {
        // Update colors from input fields
        this.colors['sticker-background-color'] = this.stickerBackgroundColorInput.value
        this.colors['sticker-border-color'] = this.stickerBorderColorInput.value
        this.colors['icon-color'] = this.iconColorInput.value
        this.colors['qr-code-background-color'] = this.qrCodeBackgroundColorInput.value
        this.colors['qr-code-foreground-color'] = this.qrCodeForegroundColorInput.value
        this.colors['label-color'] = this.labelColorInput.value

        // Save colors to localStorage
        this.saveColors()

        // Dispatch change event
        this.#dispatchChangeEvent()

        // Hide the dialog
        this.hide()
    }

    /**
     * Handles the cancel button click event.
     * Resets input fields to previous colors and hides the dialog.
     * @private
     */
    #handleCancel() {
        // Reset input fields to current colors
        this.stickerBackgroundColorInput.value = this.colors['sticker-background-color']
        this.stickerBorderColorInput.value = this.colors['sticker-border-color']
        this.iconColorInput.value = this.colors['icon-color']
        this.qrCodeBackgroundColorInput.value = this.colors['qr-code-background-color']
        this.qrCodeForegroundColorInput.value = this.colors['qr-code-foreground-color']
        this.labelColorInput.value = this.colors['label-color']

        // Hide the dialog
        this.hide()
    }
}

// Define the custom element 'fabaccess-color-settings' associated with the ColorSettings class
customElements.define('fabaccess-color-settings', ColorSettings)

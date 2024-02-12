const template = document.createElement('template')
template.innerHTML = /* html */ `
        <style> @import url("/src/Checkbox.css"); </style>
        <label class="checkbox">
            <input type="checkbox" id="checkbox" />
            <span class="checkmark"></span>
            <slot></slot>
        </label>`

class Checkbox extends HTMLElement {
    #root = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.append(template.content.cloneNode(true))

        this.#root = this.shadowRoot.getRootNode()

        const checkbox = this.#root.getElementById('checkbox')

        checkbox.addEventListener('change', this.#handleChange.bind(this), {
            passive: false
        })
    }

    #handleChange(e) {
        const val = e.target.checked
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    checked: val
                },
                composed: true
            })
        )
    }
}

customElements.define('fabaccess-checkbox', Checkbox)

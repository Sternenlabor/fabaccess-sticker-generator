import SVGRenderer from '/src/SVGRenderer.mjs'

const template = document.createElement('template')
template.innerHTML = /* html */ `
        <style> @import url("/src/PreviewBox.css"); </style>
        <div id="box"></div>`

class PreviewBox extends HTMLElement {
    value = ''
    size = 0

    #root = null
    #box = null
    #animationId = 0

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.append(template.content.cloneNode(true))

        this.#root = this.shadowRoot.getRootNode()
        this.#box = this.#root.getElementById('box')

        this.value = this.getAttribute('value') || ''
        this.size = parseFloat(this.getAttribute('size'))
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

            this.#render()
        }
    }

    update() {
        this.#render()
    }

    #clear() {
        while (this.#box.childNodes[0]) {
            this.#box.removeChild(this.#box.childNodes[0])
        }
    }

    #render() {
        window.cancelAnimationFrame(this.#animationId)
        this.#animationId = window.requestAnimationFrame(() => {
            this.#clear()
            const time = new Date()

            this.#box.innerHTML = SVGRenderer.getCode(this.value, `${this.size}mm`)

            console.log('QRCode generation time: ' + (new Date() - time) + ' ms')
        })
    }
}

customElements.define('fabaccess-preview-box', PreviewBox)

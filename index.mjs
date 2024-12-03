import SVGRenderer from '/src/SVGRenderer.mjs'
import PNGRenderer from '/src/PNGRenderer.mjs'
import PDFRenderer from '/src/PDFRenderer.mjs'
import ColorSettings from '/src/ColorSettings.mjs'

// Get references to the custom elements
const box = document.querySelector('fabaccess-preview-box')
const form = document.querySelector('fabaccess-settings-form')
const colorSettings = document.querySelector('fabaccess-color-settings')

// Event listener for changes in the settings form
form.addEventListener('change', (e) => {
    // Update the optimizeForPrint option in the SVGRenderer
    SVGRenderer.optimizeForPrint = e.detail.optimizeForPrint
    // Update the attributes of the preview box
    box.setAttribute('value', e.detail.machineID)
    box.setAttribute('size', e.detail.size)
    box.update()
})

// Event listener for changes in the color settings
colorSettings.addEventListener('colors-changed', (e) => {
    // Apply the new colors to the document
    const colors = e.detail.colors
    for (const key in colors) {
        document.documentElement.style.setProperty(`--${key}`, colors[key])
    }
    // Update the preview box
    box.update()
})

// Load colors from localStorage and apply them
ColorSettings.applyStoredColors()

// Add click event listeners to the buttons
document.querySelector('#download-qr-code-svg').addEventListener('click', () => SVGRenderer.downloadSVG(form.machineID, form.size))
document.querySelector('#download-qr-code-png').addEventListener('click', () => PNGRenderer.downloadPNG(form.machineID, form.size))
document.querySelector('#add-qr-code-to-page').addEventListener('click', () => PDFRenderer.addToPDF(form.machineID, form.size))
document.querySelector('#download-pdf').addEventListener('click', () => PDFRenderer.downloadPDF())

// Initialize the preview box
box.setAttribute('value', form.machineID)
box.setAttribute('size', form.size)

// Show the settings dialog when the settings button is clicked
const settingsButton = document.querySelector('#settings-button')
settingsButton.addEventListener('click', () => {
    colorSettings.show()
})

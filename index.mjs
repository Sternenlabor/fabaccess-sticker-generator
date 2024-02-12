import SVGRenderer from '/src/SVGRenderer.mjs'
import PNGRenderer from '/src/PNGRenderer.mjs'
import PDFRenderer from '/src/PDFRenderer.mjs'

const box = document.querySelector('fabaccess-preview-box')
const form = document.querySelector('fabaccess-settings-form')

form.addEventListener('change', (e) => {
    SVGRenderer.optimizeForPrint = e.detail.optimizeForPrint
    box.setAttribute('value', e.detail.machineID)
    box.setAttribute('size', e.detail.size)
    box.update()
})

document.querySelector('#download-qr-code-svg').addEventListener('click', () => SVGRenderer.downloadSVG(form.machineID, form.size))
document.querySelector('#download-qr-code-png').addEventListener('click', () => PNGRenderer.downloadPNG(form.machineID, form.size))
document.querySelector('#add-qr-code-to-page').addEventListener('click', () => PDFRenderer.addToPDF(form.machineID, form.size))
document.querySelector('#download-pdf').addEventListener('click', () => PDFRenderer.downloadPDF())

box.setAttribute('value', form.machineID)
box.setAttribute('size', form.size)

import '/lib/canvg/dist/umd.js'
import '/lib/canvg/v2/rgbcolor.min.js'
import '/lib/canvg/v2/stackblur.min.js'
import '/lib/canvg/v2/canvg.js'
import { changeDpiBlob } from '/lib/changeDPI/index.js'
import Utils from '/src/Utils.mjs'
import SVGRenderer from '/src/SVGRenderer.mjs'

// Constants for rendering
const DPI = 300.0
const SVG_PIXEL_HEIGHT = 108.0
const SVG_PIXEL_WIDTH = 197.0
const PADDING_BETWEEN_CODES_X = 5.0 // mm
const PADDING_BETWEEN_CODES_Y = 0.0 // mm
const PAGE_MARGIN_X = 10.0 // mm
const PAGE_MARGIN_Y = 10.0 // mm
const SPACE_BETWEEN_CODE_AND_LABEL = 4.0 // mm

export default class PDFRenderer {
    static #qrCodes = [] // Array to store QR code data
    static #pdfDoc = null // PDF document instance
    static #listeners = {} // Event listeners

    /**
     * Adds an event listener for a specific event type.
     * @param {string} event - The event type to listen for.
     * @param {Function} callback - The callback function to be called when the event is dispatched.
     */
    static addEventListener(event, callback) {
        if (!this.#listeners[event]) {
            this.#listeners[event] = []
        }
        this.#listeners[event].push(callback)
    }

    /**
     * Removes an event listener for a specific event type.
     * @param {string} event - The event type for which the listener should be removed.
     * @param {Function} callback - The callback function to remove from the listeners.
     */
    static removeEventListener(event, callback) {
        if (!this.#listeners[event]) {
            return
        }
        const callbackIndex = this.#listeners[event].indexOf(callback)
        if (callbackIndex > -1) {
            this.#listeners[event].splice(callbackIndex, 1)
        }
    }

    /**
     * Dispatches an event to all registered listeners of the event's type.
     * @param {Object} event - The event object to dispatch. Should have a 'type' property.
     */
    static dispatchEvent(event) {
        if (!this.#listeners[event.type]) {
            return
        }
        this.#listeners[event.type].forEach((callback) => {
            callback(event)
        })
    }

    /**
     * Adds a QR code to the PDF document.
     * @param {string} machineID - The machine ID to encode in the QR code.
     * @param {number|string} size - The size of the QR code in millimeters.
     */
    static async addToPDF(machineID, size) {
        const mmHeight = parseFloat(size) // Convert size to float
        const mmWidth = (mmHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH // Calculate width proportionally
        const inches = mmHeight /* mm */ / 25.4 // There are 25.4 millimeters in an inch
        const pixelHeight = inches * DPI // Calculate pixel height
        const pixelWidth = (pixelHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH // Calculate pixel width

        const height = Math.round(pixelHeight) // Round to nearest integer
        const width = Math.round(pixelWidth) // Round to nearest integer

        // Generate SVG code for the QR code
        const svgCode = SVGRenderer.getCode(machineID, height, width)

        // Create an offscreen canvas to render the SVG
        const c = new OffscreenCanvas(width, height)
        const ctx = c.getContext('2d')
        // Use canvg to render SVG to canvas
        const v = await canvg.Canvg.fromString(ctx, svgCode, canvg.presets.offscreen())

        v.resize(width, height, 'xMidYMid meet') // Resize the SVG to fit the canvas

        await v.render() // Render the SVG onto the canvas

        let b = await c.convertToBlob() // Convert canvas to Blob
        b = await changeDpiBlob(b, DPI) // Change the DPI of the blob
        const imgData = URL.createObjectURL(b) // Create a URL for the blob

        // Store QR code data
        this.#qrCodes.push({
            machineID,
            mmHeight,
            mmWidth,
            pixelHeight,
            pixelWidth,
            imgData
        })

        // Render the PDF with the new QR code
        this.renderPDF()
    }

    /**
     * Renders the PDF document with all added QR codes.
     */
    static async renderPDF() {
        const compress = 'fast' // Compression option for images

        // Create a new jsPDF document
        this.#pdfDoc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            floatPrecision: 3,
            compress: false,
            compressPdf: false
        })

        this.#pdfDoc.setFontSize(9) // Set font size for labels
        this.#pdfDoc.setTextColor('#3c474d') // Set text color

        // Get page dimensions
        const pageSize = this.#pdfDoc.internal.pageSize
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()

        // Sort QR codes by height
        this.#qrCodes.sort((a, b) => a.mmHeight - b.mmHeight)

        let curX = PAGE_MARGIN_X // Current X position
        let curY = PAGE_MARGIN_Y // Current Y position

        for (let i = 0; i < this.#qrCodes.length; i++) {
            const { machineID, imgData, mmWidth, mmHeight } = this.#qrCodes[i]

            // Add QR code image to PDF
            this.#pdfDoc.addImage(imgData, 'PNG', curX, curY, Math.round(mmWidth), Math.round(mmHeight), undefined, compress)

            // Get dimensions of the machine ID text
            const txtDim = this.#pdfDoc.getTextDimensions(machineID)

            // Add machine ID text below the QR code, centered
            this.#pdfDoc.text(machineID, curX + (mmWidth - txtDim.w) / 2, curY + mmHeight + SPACE_BETWEEN_CODE_AND_LABEL)

            curX += mmWidth + PADDING_BETWEEN_CODES_X // Update X position

            if (i < this.#qrCodes.length - 1) {
                // We are not at the end
                if (curX + PADDING_BETWEEN_CODES_X + this.#qrCodes[i + 1].mmWidth > pageWidth) {
                    // Next code will not fit on the current line
                    curX = PAGE_MARGIN_X // Reset X position
                    curY += mmHeight + SPACE_BETWEEN_CODE_AND_LABEL + txtDim.h + PADDING_BETWEEN_CODES_Y // Move to next line
                }
                if (curY + PADDING_BETWEEN_CODES_Y + this.#qrCodes[i + 1].mmHeight + SPACE_BETWEEN_CODE_AND_LABEL + txtDim.h > pageHeight) {
                    // Next code will not fit on the current page
                    this.#pdfDoc.addPage() // Add a new page
                    curX = PAGE_MARGIN_X // Reset X position
                    curY = PAGE_MARGIN_Y // Reset Y position
                }
            }
        }

        // Generate blob from PDF and create URL
        var blobPDF = new Blob([this.#pdfDoc.output('blob')], { type: 'application/pdf' })
        var blobUrl = URL.createObjectURL(blobPDF)

        // Dispatch event with the PDF URL
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    pdf: blobUrl
                },
                composed: true
            })
        )
    }

    /**
     * Initiates the download of the generated PDF document.
     */
    static downloadPDF() {
        this.#pdfDoc?.save(Utils.getFilename('pdf')) // Save the PDF with a generated filename
    }
}

import '/lib/canvg/dist/umd.js'
import '/lib/canvg/v2/rgbcolor.min.js'
import '/lib/canvg/v2/stackblur.min.js'
import '/lib/canvg/v2/canvg.js'
import { changeDpiBlob } from '/lib/changeDPI/index.js'
import Utils from '/src/Utils.mjs'
import SVGRenderer from '/src/SVGRenderer.mjs'

const DPI = 300.0
const SVG_PIXEL_HEIGHT = 108.0
const SVG_PIXEL_WIDTH = 197.0
const PADDING_BETWEEN_CODES_X = 5.0 // mm
const PADDING_BETWEEN_CODES_Y = 0.0 // mm
const PAGE_MARGIN_X = 10.0 // mm
const PAGE_MARGIN_Y = 10.0 // mm
const SPACE_BETWEEN_CODE_AND_LABEL = 4.0 // mm

export default class PDFRenderer {
    static #qrCodes = []
    static #pdfDoc = null
    static #listeners = {}

    static addEventListener(event, callback) {
        if (!this.#listeners[event]) {
            this.#listeners[event] = []
        }
        this.#listeners[event].push(callback)
    }

    static removeEventListener(event, callback) {
        if (!this.#listeners[event]) {
            return
        }
        const callbackIndex = this.#listeners[event].indexOf(callback)
        if (callbackIndex > -1) {
            this.#listeners[event].splice(callbackIndex, 1)
        }
    }

    static dispatchEvent(event) {
        if (!this.#listeners[event.type]) {
            return
        }
        this.#listeners[event.type].forEach((callback) => {
            callback(event)
        })
    }

    static async addToPDF(machineID, size) {
        const mmHeight = parseFloat(size)
        const mmWidth = (mmHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH
        const inches = mmHeight /* mm */ / 25.4 // There are 25.4 millimeters in an inch
        const pixelHeight = inches * DPI
        const pixelWidth = (pixelHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH

        const height = Math.round(pixelHeight)
        const width = Math.round(pixelWidth)

        const svgCode = SVGRenderer.getCode(machineID, height, width)

        const c = new OffscreenCanvas(width, height)
        const ctx = c.getContext('2d')
        const v = await canvg.Canvg.fromString(ctx, svgCode, canvg.presets.offscreen())

        v.resize(width, height, 'xMidYMid meet')

        await v.render()

        let b = await c.convertToBlob()
        b = await changeDpiBlob(b, DPI)
        const imgData = URL.createObjectURL(b)

        this.#qrCodes.push({
            machineID,
            mmHeight,
            mmWidth,
            pixelHeight,
            pixelWidth,
            imgData
        })

        this.renderPDF()
    }

    static async renderPDF() {
        const compress = 'fast'

        this.#pdfDoc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            floatPrecision: 3,
            compress: false,
            compressPdf: false
        })

        this.#pdfDoc.setFontSize(9)
        this.#pdfDoc.setTextColor('#3c474d')

        const pageSize = this.#pdfDoc.internal.pageSize
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
        const pageWidth = this.#pdfDoc.internal.pageSize.width || this.#pdfDoc.internal.pageSize.getWidth()

        this.#qrCodes.sort((a, b) => a.mmHeight - b.mmHeight)

        let curX = PAGE_MARGIN_X
        let curY = PAGE_MARGIN_Y

        for (let i = 0; i < this.#qrCodes.length; i++) {
            const { machineID, imgData, mmWidth, mmHeight } = this.#qrCodes[i]

            this.#pdfDoc.addImage(imgData, 'PNG', curX, curY, Math.round(mmWidth), Math.round(mmHeight), undefined, compress)

            const txtDim = this.#pdfDoc.getTextDimensions(machineID)

            this.#pdfDoc.text(machineID, curX + (mmWidth - txtDim.w) / 2, curY + mmHeight + SPACE_BETWEEN_CODE_AND_LABEL)

            curX += mmWidth + PADDING_BETWEEN_CODES_X

            if (i < this.#qrCodes.length - 1) {
                // we are not at the end
                if (curX + PADDING_BETWEEN_CODES_X + this.#qrCodes[i + 1].mmWidth > pageWidth) {
                    // next code will not fit on the current line
                    curX = PAGE_MARGIN_X
                    curY += mmHeight + SPACE_BETWEEN_CODE_AND_LABEL + txtDim.h + PADDING_BETWEEN_CODES_Y
                }
                if (curY + PADDING_BETWEEN_CODES_Y + this.#qrCodes[i + 1].mmHeight + SPACE_BETWEEN_CODE_AND_LABEL + txtDim.h > pageHeight) {
                    this.#pdfDoc.addPage()
                    curX = PAGE_MARGIN_X
                    curY = PAGE_MARGIN_Y
                }
            }
        }

        var blobPDF = new Blob([this.#pdfDoc.output('blob')], { type: 'application/pdf' })
        var blobUrl = URL.createObjectURL(blobPDF)

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    pdf: blobUrl
                },
                composed: true
            })
        )
    }

    static downloadPDF() {
        this.#pdfDoc?.save(Utils.getFilename('pdf'))
    }
}

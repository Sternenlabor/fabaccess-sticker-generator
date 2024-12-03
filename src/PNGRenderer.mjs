import '/lib/canvg/v2/rgbcolor.min.js'
import '/lib/canvg/v2/stackblur.min.js'
import '/lib/canvg/v2/canvg.js'
import '/lib/canvg/dist/umd.js'
import { changeDpiBlob } from '/lib/changeDPI/index.js'
import Utils from '/src/Utils.mjs'
import SVGRenderer from '/src/SVGRenderer.mjs'

const DPI = 300.0
const SVG_PIXEL_HEIGHT = 108.0
const SVG_PIXEL_WIDTH = 197.0

export default class PNGRenderer {
    /**
     * Downloads a PNG image of a QR code for the given machine ID and size.
     * @param {string} machineID - The machine ID to encode in the QR code.
     * @param {number|string} height - The height of the image in millimeters.
     * @param {number|null} [width=null] - The width of the image in millimeters (optional).
     */
    static async downloadPNG(machineID, height, width = null) {
        const n = Utils.getFilename('png')

        // Convert height from millimeters to inches
        const inches = parseFloat(height) /* mm */ / 25.4 // There are 25.4 millimeters in an inch
        const pixelHeight = inches * DPI // Calculate pixel height based on DPI
        const pixelWidth = (pixelHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH // Calculate pixel width proportionally

        const heightPx = Math.round(pixelHeight) // Round pixel height to nearest integer
        const widthPx = Math.round(pixelWidth) // Round pixel width to nearest integer

        // Generate SVG code for the QR code
        const svgCode = SVGRenderer.getCode(machineID, heightPx, widthPx)

        // Create an offscreen canvas to render the SVG
        const c = new OffscreenCanvas(widthPx, heightPx)
        const ctx = c.getContext('2d')
        // Use canvg to render SVG to canvas
        const v = await canvg.Canvg.fromString(ctx, svgCode, canvg.presets.offscreen())

        v.resize(widthPx, heightPx, 'xMidYMid meet') // Resize the SVG to fit the canvas

        await v.render() // Render the SVG onto the canvas

        let b = await c.convertToBlob() // Convert canvas to Blob

        b = await changeDpiBlob(b, DPI) // Change the DPI of the blob

        // Handle file download for different browsers
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(b, n) // For IE and Edge
        } else {
            const a = document.createElement('a')
            const u = URL.createObjectURL(b)

            a.href = u
            a.download = n

            document.body.appendChild(a)
            a.click()

            setTimeout(() => {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(u)
            }, 0)
        }
    }
}

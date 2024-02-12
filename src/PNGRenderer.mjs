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
    static async downloadPNG(machineID, height, width = null) {
        const n = Utils.getFilename('png')

        const inches = parseFloat(height) /* mm */ / 25.4 // There are 25.4 millimeters in an inch
        const pixelHeight = inches * DPI
        const pixelWidth = (pixelHeight / SVG_PIXEL_HEIGHT) * SVG_PIXEL_WIDTH

        const heightPx = Math.round(pixelHeight)
        const widthPx = Math.round(pixelWidth)

        const svgCode = SVGRenderer.getCode(machineID, heightPx, widthPx)

        const c = new OffscreenCanvas(widthPx, heightPx)
        const ctx = c.getContext('2d')
        const v = await canvg.Canvg.fromString(ctx, svgCode, canvg.presets.offscreen())

        v.resize(widthPx, heightPx, 'xMidYMid meet')

        await v.render()

        let b = await c.convertToBlob()

        b = await changeDpiBlob(b, DPI)

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(b, n)
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

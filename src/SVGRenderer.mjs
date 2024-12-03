import QRCode from '/lib/qrcode.min.js'
import Utils from '/src/Utils.mjs'

const SVG_PIXEL_HEIGHT = 108.0
const SVG_PIXEL_WIDTH = 197.0

export default class SVGRenderer {
    static optimizeForPrint = false

    /**
     * Generates the SVG code for a QR code with the given machine ID and dimensions.
     * @param {string} machineID - The machine ID to encode in the QR code.
     * @param {number|string} height - The height of the SVG in pixels or millimeters.
     * @param {number|null} [width=null] - The width of the SVG in pixels or millimeters (optional).
     * @returns {string} - The generated SVG code.
     */
    static getCode(machineID, height, width = null) {
        const data = {
            msg: `urn:fabaccess:resource:${machineID}`,
            dim: 82,
            pad: 4,
            mtx: -1,
            ecl: machineID?.value > 60 ? 'Q' : 'H',
            ecb: true,
            pal: ['#000', 'transparent'],
            vrb: true
        }

        let wh = ''
        if (width != null) {
            wh += `width="${width}" `
        }
        if (height) {
            wh += `height="${height}" `
        }

        // Generate the SVG code with placeholders for colors
        let svgCode = `
            <svg version="1.1" viewBox="0 0 ${SVG_PIXEL_WIDTH} ${SVG_PIXEL_HEIGHT}" ${wh} xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
                <path d="m7.35 0c-4.06 0-7.33 3.27-7.33 7.33v23h-0.0197v70.7c0 4.06 3.27 7.33 7.33 7.33h182c4.06 0 7.33-3.27 7.33-7.33v-14.2h0.0197v-79.4c0-4.06-3.27-7.33-7.33-7.33z" 
                fill="var(--primary-color)"/>
                <path d="m10.6 6.94c-2 0-3.62 1.61-3.62 3.62v25.1h-0.0197v62.5c0 2 1.61 3.62 3.62 3.62h176c2 0 3.62-1.61 3.62-3.62v-9.02h0.0196v-78.6c0-2-1.61-3.62-3.62-3.62z" 
                fill="var(--secondary-color)"/>
                <path d="m70.2 21.7c-6.84 0.0014-12.7 4.91-13.9 11.7 3.7-0.194 6.98-0.607 9.32-1.13-0.0927-0.37-0.142-0.752-0.144-1.13 0-2.6 2.11-4.7 4.7-4.7s4.7 2.09 4.7 4.7-2.09 4.7-4.7 4.7c-1.31-0.0014-2.55-0.543-3.43-1.49-2.7 0.689-6.4 1.14-10.7 1.34-0.0014 0.0507-0.0024 0.103-0.0039 0.153v28.2h28.2v-28.2c0-7.78-6.3-14.1-14.1-14.1zm-37.7 2e-3c-7.78 0-14.1 6.3-14.1 14.1v2e-3c0.0072 5.97 3.78 11.3 9.39 13.3v33.7l3.77 3.94 5.63-3.94v-3.34l-1.41-3.63 1.41-1.57v-4.14l-3.28-4.71 3.28-3.13v-1.61l-1.41-3.63 1.41-1.57v-6.38c5.62-1.99 9.38-7.3 9.39-13.3-0.0014-0.0522-0.0049-0.105-0.0078-0.155-4.21-0.196-7.93-0.656-10.7-1.35-0.887 0.953-2.13 1.5-3.43 1.5-2.6 0-4.7-2.11-4.7-4.7 0-2.6 2.11-4.7 4.7-4.7 2.6 0 4.7 2.09 4.7 4.7-0.0014 0.383-0.0491 0.764-0.144 1.14 2.36 0.53 5.63 0.933 9.3 1.13-1.19-6.74-7.03-11.7-13.8-11.7zm18.5 4.74c-2.12 0.0072-4.23 0.0814-6.24 0.222 0.517 0.688 0.975 1.41 1.37 2.18 3.39-0.186 7.03-0.185 10.5 2e-3 0.389-0.764 0.842-1.5 1.35-2.18-2.23-0.153-4.57-0.228-6.91-0.219zm-16.3 1.84c-0.682 0.223-1.26 0.465-1.74 0.743-0.765 0.438-1.48 1.05-1.5 2.04-0.0218 0.992 0.692 1.64 1.45 2.08 0.497 0.291 1.09 0.542 1.79 0.774 0.639-0.478 1.11-1.17 1.31-1.96-0.908-0.26-1.58-0.532-1.95-0.756-0.087-0.0522-0.0803-0.0561-0.13-0.0923 0.0566-0.0421 0.0578-0.0589 0.165-0.12 0.387-0.222 1.05-0.484 1.92-0.735-0.195-0.8-0.667-1.49-1.31-1.96zm33.4 0c-0.638 0.478-1.11 1.17-1.31 1.96 0.983 0.28 1.68 0.581 2.04 0.812 0.0348 0.0218 0.0212 0.016 0.0472 0.0334-0.0552 0.0435-0.0596 0.0598-0.161 0.118-0.387 0.223-1.05 0.488-1.93 0.743 0.196 0.8 0.665 1.49 1.31 1.96 0.689-0.226 1.27-0.468 1.76-0.75 0.731-0.422 1.41-0.987 1.48-1.93 0.071-0.947-0.587-1.64-1.28-2.08-0.53-0.336-1.18-0.615-1.95-0.872zm-13 5.14c-2.46 0.0942-5 0.0963-7.46 2e-3 0.122 0.751 0.188 1.51 0.196 2.28 2.34 0.0827 4.73 0.0821 7.07-2e-3 0.0072-0.76 0.0742-1.52 0.194-2.28zm4.73 4.73h20.6c0.782 0 1.41 0.628 1.41 1.41v20.6c0 0.782-0.628 1.41-1.41 1.41h-20.6c-0.779 0-1.41-0.626-1.41-1.41v-20.6c0-0.779 0.63-1.41 1.41-1.41zm10.4 5.87c-3.01 0-6.01 1.14-8.31 3.43-0.458 0.46-0.458 1.21 0 1.66 0.458 0.458 1.21 0.458 1.66 0 3.66-3.66 9.63-3.66 13.3 0 0.23 0.23 0.531 0.343 0.831 0.343s0.601-0.114 0.831-0.343c0.458-0.46 0.458-1.21 0-1.66-2.3-2.29-5.3-3.43-8.31-3.43zm0 3.52c-2.19 0-4.26 0.855-5.82 2.41-0.458 0.46-0.458 1.21 0 1.66 0.458 0.458 1.21 0.458 1.66 0 1.11-1.11 2.59-1.72 4.16-1.72s3.04 0.611 4.16 1.72c0.23 0.23 0.531 0.343 0.831 0.343s0.601-0.114 0.831-0.343c0.458-0.458 0.458-1.21 0-1.66-1.55-1.55-3.62-2.41-5.81-2.41zm-2e-3 3.52c-1.21 0-2.41 0.458-3.31 1.37-0.458 0.46-0.458 1.21 0 1.66 0.458 0.458 1.21 0.458 1.66 0 0.914-0.916 2.41-0.916 3.31 0 0.231 0.23 0.531 0.343 0.831 0.343s0.601-0.114 0.831-0.343c0.458-0.46 0.458-1.21 0-1.66-0.916-0.915-2.12-1.37-3.32-1.37zm-39.9 1.18h2.35v28.2h-2.35zm39.9 2.35c-0.648 0-1.18 0.527-1.18 1.18s0.527 1.18 1.18 1.18c0.651 0 1.18-0.527 1.18-1.18s-0.525-1.18-1.18-1.18z" 
                fill="var(--primary-color)"/>
                <path d="m181 91.6h-74.1v-74.1h74.1z" fill="var(--primary-color)"/>
                ${QRCode(data).outerHTML.replace('<svg', '<svg x="103" y="14"').replace('fill="#000"', 'fill="var(--secondary-color)"')}
            </svg>
        `

        if (this.optimizeForPrint) {
            svgCode = Utils.replace(svgCode, {
                'var(--primary-color)': Utils.getCssValue('--primary-color-print'),
                'var(--secondary-color)': Utils.getCssValue('--secondary-color-print')
            })
        } else {
            svgCode = Utils.replace(svgCode, {
                'var(--primary-color)': Utils.getCssValue('--primary-color'),
                'var(--secondary-color)': Utils.getCssValue('--secondary-color')
            })
        }

        return svgCode
    }

    /**
     * Downloads the generated SVG code as an SVG file.
     * @param {string} machineID - The machine ID to encode in the QR code.
     * @param {number|string} height - The height of the SVG in pixels or millimeters.
     * @param {number|null} [width=null] - The width of the SVG in pixels or millimeters (optional).
     */
    static async downloadSVG(machineID, height, width = null) {
        const svgCode = this.getCode(machineID, height, width)

        const n = Utils.getFilename('svg')

        // Create a new Blob object with the SVG code
        const b = new Blob([svgCode], {
            type: 'image/svg+xml'
        })

        // Handle file download
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

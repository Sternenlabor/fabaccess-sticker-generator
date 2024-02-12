import ColorUtils from '/src/ColorUtils.mjs'

export default class Utils {
    static replace(d, r) {
        for (const k of Object.keys(r)) {
            d = d.replaceAll(k, r[k])
        }
        return d
    }

    static getFilename(type) {
        const dateTime = this.replace(new Date().toISOString().slice(0, 19), {
            ':': '',
            '-': '',
            T: '-'
        })
        switch (type) {
            case 'svg':
            case 'png':
                return `fabaccess-qrcode-${dateTime}.${type}`
            case 'pdf':
                return `fabaccess-qrcodes-${dateTime}.pdf`
        }
        return `fabaccess-${dateTime}.${type}`
    }

    static getCssValue(prop) {
        const cssColorFunction = getComputedStyle(document.documentElement).getPropertyValue(prop)
        return cssColorFunction
        //return ColorUtils.convertColor(cssColorFunction) //fuuuu Firefox
    }
}

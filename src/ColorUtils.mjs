import Color from '/lib/color.js'

// Thanks to Firefox who's not supporting all color stuff in SVG like Chrome does ... we need to do this...
export default class ColorUtils {
    static convertColor(cssColorFunction) {
        // Regular expression to match hex color codes
        const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

        // Check if the input is a valid hex color code
        if (hexColorRegex.test(cssColorFunction)) {
            return cssColorFunction // Return the hex color code if it matches the pattern
        } else {
            // Extracting the adjustments and hex value
            const result = this.extractAdjustmentsAndHex(cssColorFunction)

            if (result) {
                const oklch = new Color(result.hex).to('oklch')

                console.log(oklch.l, oklch.c, oklch.h)

                oklch.l += result.lAdjust
                oklch.c += result.cAdjust
                oklch.h += result.hAdjust

                console.log(oklch.l, oklch.c, oklch.h)

                const hex = oklch.to('a98rgb').toString({ format: 'hex' })

                console.log(hex)

                return hex
            } else {
                console.log('No values found.', cssColorFunction)
            }
        }
    }

    static extractAdjustmentsAndHex(css) {
        const regex = /oklch\(from (#\w{6}) calc\(l \+ ([\d\.\-]+)\) calc\(c \+ ([\d\.\-]+)\) calc\(h - ([\d\.\-]+)\)\)/
        const matches = css.match(regex)

        if (matches) {
            const [_, hex, lAdjust, cAdjust, hAdjust] = matches
            return {
                hex: hex,
                lAdjust: parseFloat(lAdjust),
                cAdjust: parseFloat(cAdjust),
                hAdjust: parseFloat(hAdjust)
            }
        } else {
            // Return null or some default values if no matches found
            return null
        }
    }
}

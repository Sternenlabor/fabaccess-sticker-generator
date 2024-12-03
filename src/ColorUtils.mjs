import Color from '/lib/color.js' // Import the Color library

// Due to Firefox not supporting all color functionalities in SVG like Chrome does, we need to do this workaround
export default class ColorUtils {
    /**
     * Converts a CSS color function to a hex color code.
     * @param {string} cssColorFunction - The CSS color function string to convert.
     * @returns {string|null} - The converted hex color code or null if conversion is not possible.
     */
    static convertColor(cssColorFunction) {
        // Regular expression to match hex color codes (e.g., #FFF or #FFFFFF)
        const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

        // Check if the input is a valid hex color code
        if (hexColorRegex.test(cssColorFunction)) {
            return cssColorFunction // Return the hex color code if it matches the pattern
        } else {
            // Extract the adjustments and hex value from the CSS color function
            const result = this.extractAdjustmentsAndHex(cssColorFunction)

            if (result) {
                // Create a new Color object from the extracted hex value and convert it to OKLCH color space
                const oklch = new Color(result.hex).to('oklch')

                console.log(oklch.l, oklch.c, oklch.h) // Log the original OKLCH values

                // Apply the adjustments to the OKLCH components
                oklch.l += result.lAdjust
                oklch.c += result.cAdjust
                oklch.h += result.hAdjust

                console.log(oklch.l, oklch.c, oklch.h) // Log the adjusted OKLCH values

                // Convert the adjusted OKLCH color back to a hex color code in A98 RGB color space
                const hex = oklch.to('a98rgb').toString({ format: 'hex' })

                console.log(hex) // Log the final hex color code

                return hex // Return the final hex color code
            } else {
                // If no adjustments and hex value could be extracted, log a message
                console.log('No values found.', cssColorFunction)
            }
        }
    }

    /**
     * Extracts adjustments and hex value from a CSS OKLCH color function string.
     * @param {string} css - The CSS color function string to extract from.
     * @returns {Object|null} - An object containing hex, lAdjust, cAdjust, hAdjust or null if no matches found.
     */
    static extractAdjustmentsAndHex(css) {
        // Regular expression to match the specific OKLCH color function format
        const regex = /oklch\(from (#\w{6}) calc\(l \+ ([\d\.\-]+)\) calc\(c \+ ([\d\.\-]+)\) calc\(h - ([\d\.\-]+)\)\)/
        const matches = css.match(regex)

        if (matches) {
            // Destructure the matches to extract hex value and adjustments
            const [_, hex, lAdjust, cAdjust, hAdjust] = matches
            return {
                hex: hex, // Original hex color code
                lAdjust: parseFloat(lAdjust), // Adjustment for lightness
                cAdjust: parseFloat(cAdjust), // Adjustment for chroma
                hAdjust: parseFloat(hAdjust) // Adjustment for hue
            }
        } else {
            // Return null if no matches found
            return null
        }
    }
}

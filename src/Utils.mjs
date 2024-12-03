import ColorUtils from '/src/ColorUtils.mjs' // Import the ColorUtils module

// Define the Utils class providing utility functions
export default class Utils {
    /**
     * Replaces all occurrences of specified substrings in a string with their corresponding replacements.
     * @param {string} d - The original string to perform replacements on.
     * @param {Object} r - An object where keys are substrings to replace, and values are their replacements.
     * @returns {string} - The modified string with replacements made.
     */
    static replace(d, r) {
        // Iterate over each key in the replacements object
        for (const k of Object.keys(r)) {
            // Replace all occurrences of the key with its corresponding value
            d = d.replaceAll(k, r[k])
        }
        return d // Return the modified string
    }

    /**
     * Generates a filename based on the current date and time and the specified file type.
     * @param {string} type - The file extension or type (e.g., 'svg', 'png', 'pdf').
     * @returns {string} - The generated filename.
     */
    static getFilename(type) {
        // Get the current date and time in ISO format and remove special characters
        const dateTime = this.replace(new Date().toISOString().slice(0, 19), {
            ':': '',
            '-': '',
            T: '-'
        })
        // Determine the filename format based on the file type
        switch (type) {
            case 'svg':
            case 'png':
                return `fabaccess-qrcode-${dateTime}.${type}` // For SVG and PNG files
            case 'pdf':
                return `fabaccess-qrcodes-${dateTime}.pdf` // For PDF files
        }
        // Default filename format if type doesn't match known cases
        return `fabaccess-${dateTime}.${type}`
    }

    /**
     * Retrieves the computed CSS value of a given property.
     * @param {string} prop - The CSS property name.
     * @returns {string} - The computed CSS value.
     */
    static getCssValue(prop) {
        // Get the computed style of the root document element for the given property
        const cssColorFunction = getComputedStyle(document.documentElement).getPropertyValue(prop)
        return cssColorFunction // Return the computed CSS value
        //return ColorUtils.convertColor(cssColorFunction) // fuuuu Firefox
    }
}

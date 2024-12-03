import '/lib/jspdf/build/pdf.mjs'
import '/lib/jspdf/polyfills.umd.js'
import '/lib/jspdf/jspdf.umd.js'
import PDFRenderer from '/src/PDFRenderer.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/jspdf/build/pdf.worker.mjs'

// Create a template element to define the structure of the PDF viewer component
const template = document.createElement('template')
template.innerHTML = /* html */ `
    <style> @import url("/src/PDFViewer.css"); </style>
    <div id="pdf-viewer">
        <div class="toolbar">
            <button id="prev" class="toolbar-button" title="Previous Page">
                <span>Previous</span>
            </button>
            <button id="next" class="toolbar-button" title="Next Page">
                <span>Next</span>
            </button>
            <span id="npages"></span>

            <span id="pdf-title">PDF</span>

            <!--
            <button id="print" class="toolbar-button" title="Print">
                <span>Print</span>
            </button>
            -->
            <button id="download" class="toolbar-button" title="Save">
                <span>Save</span>
            </button>
        </div>
        <canvas id="cnv"></canvas>
    </div>`

// Define a custom PDFViewer class that extends HTMLElement
class PDFViewer extends HTMLElement {
    #root = null // Private property to store the root node

    /**
     * Creates an instance of PDFViewer and initializes the component.
     */
    constructor() {
        super() // Call the parent class constructor

        // Attach a shadow DOM tree to this element
        this.attachShadow({ mode: 'open' })
        // Append the cloned template content to the shadow root
        this.shadowRoot.append(template.content.cloneNode(true))

        // Get the root node of the shadow DOM
        this.#root = this.shadowRoot.getRootNode()

        // Add event listener for the 'download' button to download the PDF
        // this.#root.querySelector('#print').addEventListener('click', () => {})
        this.#root.querySelector('#download').addEventListener('click', () => PDFRenderer.downloadPDF())

        // Listen for 'change' events from PDFRenderer to display the PDF
        PDFRenderer.addEventListener('change', (e) => {
            this.showPDF(e.detail.pdf)
        })
    }

    /**
     * Displays the PDF document in the viewer.
     * @param {string} blobUrl - The URL of the PDF blob to display.
     */
    async showPDF(blobUrl) {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(blobUrl)
        const canvas = this.#root.querySelector('#cnv') // Get the canvas element
        const ctx = canvas.getContext('2d') // Get the 2D rendering context
        const scale = 1.5 // Scale for rendering the PDF pages
        let numPage = 1 // Current page number

        const doc = await loadingTask.promise // Wait for the PDF to be loaded

        /**
         * Renders a specific page of the PDF document.
         * @param {number} numPage - The page number to display.
         */
        const showPage = async (numPage) => {
            const page = await doc.getPage(numPage) // Get the page
            let viewport = page.getViewport({ scale: scale }) // Get the viewport at the desired scale
            canvas.height = viewport.height // Set canvas height
            canvas.width = viewport.width // Set canvas width

            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            }

            await page.render(renderContext) // Render the page into the canvas

            // Update the page number display
            this.#root.querySelector('#npages').innerHTML = `Page ${numPage} / ${doc.numPages}`
        }

        // Show the first page
        this.#root.querySelector('#npages').innerHTML = `Page 1 / ${doc.numPages}`
        showPage(numPage)

        // Function to go to the previous page
        const prevPage = () => {
            if (numPage === 1) {
                return // Do nothing if already at the first page
            }
            numPage--
            showPage(numPage)
        }

        // Function to go to the next page
        const nextPage = () => {
            if (numPage >= doc.numPages) {
                return // Do nothing if already at the last page
            }
            numPage++
            showPage(numPage)
        }

        // Add event listeners for the 'prev' and 'next' buttons
        this.#root.querySelector('#prev').addEventListener('click', prevPage)
        this.#root.querySelector('#next').addEventListener('click', nextPage)
    }
}

// Define the custom element 'fabaccess-pdf-viewer' associated with the PDFViewer class
customElements.define('fabaccess-pdf-viewer', PDFViewer)

import '/lib/jspdf/build/pdf.mjs'
import '/lib/jspdf/polyfills.umd.js'
import '/lib/jspdf/jspdf.umd.js'
import PDFRenderer from '/src/PDFRenderer.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/jspdf/build/pdf.worker.mjs'

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

class PDFViewer extends HTMLElement {
    #root = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.append(template.content.cloneNode(true))

        this.#root = this.shadowRoot.getRootNode()

        //this.#root.querySelector('#print').addEventListener('click', () => {})
        this.#root.querySelector('#download').addEventListener('click', () => PDFRenderer.downloadPDF())

        PDFRenderer.addEventListener('change', (e) => {
            this.showPDF(e.detail.pdf)
        })
    }

    async showPDF(blobUrl) {
        const loadingTask = pdfjsLib.getDocument(blobUrl)
        const canvas = this.#root.querySelector('#cnv')
        const ctx = canvas.getContext('2d')
        const scale = 1.5
        let numPage = 1

        const doc = await loadingTask.promise

        const showPage = async (numPage) => {
            const page = await doc.getPage(numPage)
            let viewport = page.getViewport({ scale: scale })
            canvas.height = viewport.height
            canvas.width = viewport.width

            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            }

            page.render(renderContext)

            this.#root.querySelector('#npages').innerHTML = `Page ${numPage} / ${doc.numPages}`
        }

        this.#root.querySelector('#npages').innerHTML = `Page 1 / ${doc.numPages}`
        showPage(numPage)

        const prevPage = () => {
            if (numPage === 1) {
                return
            }
            numPage--
            showPage(numPage)
        }

        const nextPage = () => {
            if (numPage >= doc.numPages) {
                return
            }
            numPage++
            showPage(numPage)
        }

        this.#root.querySelector('#prev').addEventListener('click', prevPage)
        this.#root.querySelector('#next').addEventListener('click', nextPage)
    }
}

customElements.define('fabaccess-pdf-viewer', PDFViewer)

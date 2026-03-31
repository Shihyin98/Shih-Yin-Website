// Flipbook functionality using PDF.js
class PdfFlipbook {
    constructor(containerId, pdfPath) {
        this.container = document.getElementById(containerId);
        this.pdfPath = pdfPath;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.numPages = 0;
        this.scale = 2;
        this.renderedPages = new Set();
        this.isResizing = false;

        this.init();
        this.setupResizeListener();
    }

    async init() {
        try {
            // Set working directory for PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            // Load PDF
            this.pdfDoc = await pdfjsLib.getDocument(this.pdfPath).promise;
            this.numPages = this.pdfDoc.numPages;

            this.setupControls();

            // Render first page
            await this.renderPage(1);
        } catch (error) {
            this.showError(`無法加載 PDF: ${error.message}`);
            console.error('PDF Loading Error:', error);
        }
    }

    calculateScale() {
        // 根据容器宽度动态计算缩放比例
        const containerWidth = this.container.clientWidth;
        // 假设 A4 纸宽度约 210mm，在屏幕上显示
        return Math.min(containerWidth / 200, 3);
    }

    async renderPage(pageNum) {
        if (pageNum < 1 || pageNum > this.numPages) return;

        try {
            this.currentPage = pageNum;

            // Get page
            const page = await this.pdfDoc.getPage(pageNum);

            // 动态计算缩放比例
            const scale = this.calculateScale();

            // Setup viewport
            const viewport = page.getViewport({ scale: scale });

            // Create or get canvas
            let canvas = document.getElementById(`page-${pageNum}`);
            if (!canvas || this.isResizing) {
                // 如果是窗口调整大小，需要重新渲染
                if (canvas) {
                    canvas.remove();
                    const pageDiv = document.getElementById(`page-div-${pageNum}`);
                    if (pageDiv) pageDiv.remove();
                }

                canvas = document.createElement('canvas');
                canvas.id = `page-${pageNum}`;
                
                const pageDiv = document.createElement('div');
                pageDiv.className = 'flipbook-page';
                pageDiv.id = `page-div-${pageNum}`;
                pageDiv.appendChild(canvas);
                
                this.container.appendChild(pageDiv);
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render page to canvas
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // Update page display
            this.updatePageDisplay();
        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
        }
    }

    updatePageDisplay() {
        // Hide all pages
        document.querySelectorAll('.flipbook-page').forEach(page => {
            page.classList.remove('active');
        });

        // Show current page
        const currentPageDiv = document.getElementById(`page-div-${this.currentPage}`);
        if (currentPageDiv) {
            currentPageDiv.classList.add('active');
        }

        // Update current page info
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `第 ${this.currentPage} / ${this.numPages} 頁`;
        }

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.numPages;
    }

    setupControls() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (!prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', async () => {
            if (this.currentPage > 1) {
                await this.renderPage(this.currentPage - 1);
            }
        });

        nextBtn.addEventListener('click', async () => {
            if (this.currentPage < this.numPages) {
                await this.renderPage(this.currentPage + 1);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentPage > 1) prevBtn.click();
            if (e.key === 'ArrowRight' && this.currentPage < this.numPages) nextBtn.click();
        });
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(async () => {
                if (this.pdfDoc) {
                    this.isResizing = true;
                    // 清空所有已渲染页面
                    document.querySelectorAll('.flipbook-page').forEach(page => page.remove());
                    // 重新渲染当前页面
                    await this.renderPage(this.currentPage);
                    this.isResizing = false;
                }
            }, 250); // 等待用户停止调整大小 250ms 后再重新渲染
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'flipbook-error';
        errorDiv.textContent = message;
        this.container.innerHTML = '';
        this.container.appendChild(errorDiv);
    }
}

// Initialize flipbook when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load flipbook with resume.pdf from assets folder
    new PdfFlipbook('flipbook', 'assets/CV.pdf');
});

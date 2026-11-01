const url = './document.pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.25;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d'),
      pageInput = document.getElementById('page-num-input');

// Hiển thị một trang cụ thể
const renderPage = (num) => {
  pageIsRendering = true;

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    pageInput.value = num;
  });
};

const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

const showPrevPage = () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
};

const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
};

const zoomIn = () => {
  scale += 0.25;
  queueRenderPage(pageNum);
};

const zoomOut = () => {
  if (scale <= 0.5) return;
  scale -= 0.25;
  queueRenderPage(pageNum);
};

// Xử lý khi người dùng gõ số trang rồi nhấn Enter hoặc đổi số
pageInput.addEventListener('change', (e) => {
  const num = parseInt(e.target.value);
  if (num >= 1 && num <= pdfDoc.numPages) {
    pageNum = num;
    queueRenderPage(pageNum);
  } else {
    pageInput.value = pageNum; // Đổi lại số cũ nếu nhập quá giới hạn
  }
});

pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
  pdfDoc = pdfDoc_;
  document.getElementById('page-count').textContent = pdfDoc.numPages;
  renderPage(pageNum);
}).catch((err) => {
  console.error('Lỗi khi tải file PDF:', err);
  alert('Không thể tải file PDF. Hãy đảm bảo file "document.pdf" nằm cùng thư mục!');
});

document.getElementById('prev-page').addEventListener('click', showPrevPage);
document.getElementById('next-page').addEventListener('click', showNextPage);
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);

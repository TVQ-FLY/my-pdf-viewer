// Đường dẫn tới file PDF của bạn (đặt cùng thư mục root với file html)
const url = "./document.pdf";

// Cấu hình worker cho PDF.js từ CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.25;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d');

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

    document.getElementById('page-num').textContent = num;
  });
};

// Đưa trang vào hàng đợi render nếu đang bận
const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Chuyển trang trước
const showPrevPage = () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
};

// Chuyển trang sau
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
};

// Phóng to
const zoomIn = () => {
  scale += 0.25;
  queueRenderPage(pageNum);
};

// Thu nhỏ
const zoomOut = () => {
  if (scale <= 0.5) return;
  scale -= 0.25;
  queueRenderPage(pageNum);
};

// Tải tài liệu PDF
pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
  pdfDoc = pdfDoc_;
  document.getElementById('page-count').textContent = pdfDoc.numPages;
  renderPage(pageNum);
}).catch((err) => {
  console.error('Lỗi khi tải file PDF:', err);
  alert('Không thể tải file PDF. Hãy đảm bảo file "document.pdf" nằm cùng thư mục!');
});

// Gán sự kiện click cho các nút
document.getElementById('prev-page').addEventListener('click', showPrevPage);
document.getElementById('next-page').addEventListener('click', showNextPage);
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);
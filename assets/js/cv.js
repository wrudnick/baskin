/* Render the CV PDF inline, page by page, into #cv-pages. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var pagesEl = document.getElementById("cv-pages");
    var statusEl = document.getElementById("cv-status");
    var dlEl = document.getElementById("cv-download");

    window.DATA.loadSite().then(function (site) {
      var cv = (site && site.cv) || {};
      var file = window.assetUrl(cv.file);

      if (dlEl && file) {
        dlEl.href = file;
        dlEl.setAttribute("download", "");
      }
      if (!pagesEl || !file) {
        if (statusEl) statusEl.textContent = "No CV uploaded yet.";
        return;
      }
      if (!window.pdfjsLib) {
        statusEl.textContent = "Could not load the PDF viewer.";
        return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/pdfjs/pdf.worker.min.js";
      var scale = Math.min(2, (window.devicePixelRatio || 1) * 1.3);

      return pdfjsLib.getDocument(file).promise.then(function (pdf) {
        statusEl.textContent = "";
        var chain = Promise.resolve();
        for (var n = 1; n <= pdf.numPages; n++) {
          (function (num) {
            chain = chain.then(function () {
              return pdf.getPage(num).then(function (page) {
                var viewport = page.getViewport({ scale: scale });
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                pagesEl.appendChild(canvas);
                return page.render({ canvasContext: ctx, viewport: viewport }).promise;
              });
            });
          })(n);
        }
        return chain;
      });
    }).catch(function (err) {
      if (statusEl) {
        statusEl.innerHTML = "The CV PDF isn’t available yet. Upload it in the admin.";
      }
      console.warn("CV render error:", err);
    });
  });
})();

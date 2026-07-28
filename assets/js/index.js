(function () {
  var storageKey = "resume-theme";
  var body = document.body;
  var pdfFallback = "files/Muhammad-Naeem-Paracha-Resume.pdf";
  var isGeneratingPdf = false;

  function getPreferredTheme() {
    var saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
    localStorage.setItem(storageKey, theme);
    updateToggle(theme);
  }

  function currentTheme() {
    return body.classList.contains("dark") ? "dark" : "light";
  }

  function updateToggle(theme) {
    var button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }
    var icon = button.querySelector("i");
    if (!icon) {
      return;
    }
    if (theme === "dark") {
      icon.className = "fas fa-sun";
      button.setAttribute("title", "Switch to light mode");
      button.setAttribute("aria-label", "Switch to light mode");
    } else {
      icon.className = "fas fa-moon";
      button.setAttribute("title", "Switch to dark mode");
      button.setAttribute("aria-label", "Switch to dark mode");
    }
  }

  function createToggle() {
    var icons = document.querySelector("ul.icons");
    if (!icons || document.getElementById("theme-toggle")) {
      return;
    }

    var li = document.createElement("li");
    var button = document.createElement("button");
    button.type = "button";
    button.id = "theme-toggle";
    button.className = "button button--sacnite button--round-l theme-toggle";
    button.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
    button.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    li.appendChild(button);
    icons.insertBefore(li, icons.firstChild);
    updateToggle(currentTheme());
  }

  function setDownloadBusy(isBusy) {
    var buttons = document.querySelectorAll(".resume-download");
    buttons.forEach(function (button) {
      if (isBusy) {
        button.classList.add("is-busy");
        button.setAttribute("aria-busy", "true");
        button.dataset.originalText = button.textContent;
        button.textContent = "Preparing PDF...";
      } else {
        button.classList.remove("is-busy");
        button.removeAttribute("aria-busy");
        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    });
  }

  function buildExportRoot() {
    var root = document.createElement("div");
    root.className = "pdf-export-root";

    var header = document.querySelector(".header-container");
    var content = document.querySelector(".page-content .wrapper");

    if (header) {
      root.appendChild(header.cloneNode(true));
    }
    if (content) {
      root.appendChild(content.cloneNode(true));
    }

    root.querySelectorAll(".no-print, .theme-toggle, .resume-download, #theme-toggle").forEach(function (el) {
      el.remove();
    });

    return root;
  }

  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "pdf-overlay";
    overlay.innerHTML = '<p class="pdf-overlay__text">Generating your PDF resume...</p>';
    return overlay;
  }

  function downloadGeneratedPdf() {
    if (isGeneratingPdf) {
      return;
    }

    if (typeof html2pdf === "undefined") {
      window.location.href = pdfFallback;
      return;
    }

    isGeneratingPdf = true;
    setDownloadBusy(true);

    var wasDark = body.classList.contains("dark");
    var scrollY = window.pageYOffset;
    body.classList.remove("dark");

    var exportRoot = buildExportRoot();
    var overlay = buildOverlay();
    document.body.appendChild(exportRoot);
    document.body.appendChild(overlay);
    body.classList.add("exporting-pdf");
    window.scrollTo(0, 0);

    var options = {
      margin: [10, 10, 10, 10],
      filename: "Muhammad-Naeem-Paracha-Resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1100,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".layout", ".profile-img"] }
    };

    html2pdf()
      .set(options)
      .from(exportRoot)
      .save()
      .catch(function () {
        window.location.href = pdfFallback;
      })
      .then(function () {
        exportRoot.remove();
        overlay.remove();
        body.classList.remove("exporting-pdf");
        if (wasDark) {
          body.classList.add("dark");
        }
        window.scrollTo(0, scrollY);
        setDownloadBusy(false);
        isGeneratingPdf = false;
      });
  }

  function isDownloadTrigger(target) {
    if (!target) {
      return false;
    }

    if (target.closest(".resume-download")) {
      return true;
    }

    var iconLink = target.closest("a");
    if (!iconLink) {
      return false;
    }

    var icon = iconLink.querySelector("i");
    return !!(icon && (icon.classList.contains("fa-download") || icon.getAttribute("title") === "Download Resume"));
  }

  document.addEventListener("click", function (event) {
    if (!isDownloadTrigger(event.target)) {
      return;
    }
    event.preventDefault();
    downloadGeneratedPdf();
  });

  applyTheme(getPreferredTheme());
  createToggle();
})();

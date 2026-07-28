(function () {
  var storageKey = "resume-theme";
  var body = document.body;
  var pdfFallback = new URL("files/Muhammad-Naeem-Paracha-Resume.pdf", window.location.href).href;
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

  function downloadFallbackPdf() {
    var link = document.createElement("a");
    link.href = pdfFallback;
    link.download = "Muhammad-Naeem-Paracha-Resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function replaceProfileImage(root) {
    var span = root.querySelector(".profile-img");
    if (!span) {
      return;
    }

    var column = span.closest(".no-print");
    if (column) {
      column.classList.remove("no-print");
    }

    var match = /url\(["']?(.*?)["']?\)/.exec(span.getAttribute("style") || "");
    if (!match) {
      return;
    }

    var img = document.createElement("img");
    img.src = new URL(match[1], window.location.href).href;
    img.className = "pdf-profile-img";
    img.alt = "Profile photo";
    img.crossOrigin = "anonymous";
    span.replaceWith(img);
  }

  function waitForImages(root) {
    var images = Array.prototype.slice.call(root.querySelectorAll("img"));
    return Promise.all(
      images.map(function (img) {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise(function (resolve) {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  }

  function buildExportRoot() {
    var root = document.createElement("div");
    root.className = "pdf-export-root";
    root.setAttribute("aria-hidden", "true");

    var header = document.querySelector(".header-container");
    var content = document.querySelector(".page-content .wrapper");

    if (header) {
      root.appendChild(header.cloneNode(true));
    }
    if (content) {
      root.appendChild(content.cloneNode(true));
    }

    replaceProfileImage(root);

    root.querySelectorAll(".no-print, .theme-toggle, .resume-download, #theme-toggle").forEach(function (el) {
      el.remove();
    });

    return root;
  }

  function downloadGeneratedPdf() {
    if (isGeneratingPdf) {
      return;
    }

    if (typeof html2pdf === "undefined") {
      downloadFallbackPdf();
      return;
    }

    isGeneratingPdf = true;
    setDownloadBusy(true);

    var wasDark = body.classList.contains("dark");
    var scrollY = window.pageYOffset || 0;
    body.classList.remove("dark");
    body.classList.add("exporting-pdf");

    var exportRoot = buildExportRoot();
    document.body.appendChild(exportRoot);
    window.scrollTo(0, 0);

    var options = {
      margin: [8, 8, 8, 8],
      filename: "Muhammad-Naeem-Paracha-Resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: exportRoot.scrollWidth,
        windowHeight: exportRoot.scrollHeight
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    waitForImages(exportRoot)
      .then(function () {
        // Give the browser a paint frame so layout/dimensions are ready.
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            requestAnimationFrame(resolve);
          });
        });
      })
      .then(function () {
        if (!exportRoot.scrollHeight || !exportRoot.scrollWidth) {
          throw new Error("Empty export root");
        }
        return html2pdf().set(options).from(exportRoot).save();
      })
      .catch(function () {
        downloadFallbackPdf();
      })
      .finally(function () {
        exportRoot.remove();
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

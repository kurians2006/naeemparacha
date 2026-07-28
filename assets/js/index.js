(function () {
  var storageKey = "resume-theme";
  var body = document.body;

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

  // Most reliable PDF path for this theme: browser Print -> Save as PDF.
  function preparePrintableProfile() {
    var span = document.querySelector(".profile-img");
    if (!span || document.querySelector(".print-profile-img")) {
      return;
    }

    var match = /url\(["']?(.*?)["']?\)/.exec(span.getAttribute("style") || "");
    if (!match) {
      return;
    }

    var img = document.createElement("img");
    img.className = "print-profile-img";
    img.src = new URL(match[1], window.location.href).href;
    img.alt = "Profile photo";
    span.parentNode.insertBefore(img, span);
  }

  function downloadResumeAsPdf() {
    var wasDark = body.classList.contains("dark");
    body.classList.remove("dark");
    body.classList.add("printing-pdf");
    preparePrintableProfile();

    var restore = function () {
      body.classList.remove("printing-pdf");
      if (wasDark) {
        body.classList.add("dark");
      }
      window.removeEventListener("afterprint", restore);
    };

    window.addEventListener("afterprint", restore);

    // Tiny delay so light-mode styles apply before the print dialog opens.
    setTimeout(function () {
      window.print();
      // Safari sometimes skips afterprint; restore as a safety net.
      setTimeout(restore, 1000);
    }, 50);
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
    downloadResumeAsPdf();
  });

  applyTheme(getPreferredTheme());
  createToggle();
})();

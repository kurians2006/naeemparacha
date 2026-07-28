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

  applyTheme(getPreferredTheme());
  createToggle();
})();

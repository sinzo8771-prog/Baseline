// Sets the theme synchronously before the app mounts to avoid a flash of the
// wrong theme for users who picked a theme opposite their OS default.
// Extracted from index.html so the site can ship a strict Content-Security-Policy
// (script-src 'self') without an inline-script hash to maintain.
(function () {
  try {
    var t = localStorage.getItem("baseline-theme");
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
// Copy a string to the clipboard with a graceful fallback, returning whether
// the copy succeeded. Uses the modern async Clipboard API where available,
// falling back to a hidden textarea for older browsers / non-secure contexts.

export async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path (e.g. clipboard blocked in an iframe).
    }
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

// Absolute URL for a story permalink, safe to share / copy.
export function storyUrl(id, base = window.location.origin) {
  return `${base.replace(/\/$/, "")}/story/${encodeURIComponent(id)}`;
}

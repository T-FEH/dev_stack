// Shared DOM helpers used across the app.

import { getSavedCount } from "./storage.mjs";

// Short query selector.
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

// Render a list into a parent using a template function that returns an HTML string.
// position: insertAdjacentHTML position ("beforeend" by default).
// clear: empty the parent first (default true).
export function renderListWithTemplate(
  templateFn,
  parent,
  list,
  position = "beforeend",
  clear = true
) {
  if (!parent) return;
  if (clear) parent.innerHTML = "";
  const html = list.map(templateFn).join("");
  parent.insertAdjacentHTML(position, html);
}

// Friendly empty-state message shown when a list has no items.
export function renderEmptyState(parent, message) {
  if (!parent) return;
  parent.innerHTML = `<p class="state">${message}</p>`;
}

// User-facing error message shown when a fetch fails.
export function renderError(parent, message) {
  if (!parent) return;
  parent.innerHTML = `<p class="state error" role="alert">${message}</p>`;
}

// Loading placeholders while data is fetched.
export function renderLoading(parent, count = 4) {
  if (!parent) return;
  parent.innerHTML = Array.from({ length: count })
    .map(() => `<div class="skeleton" aria-hidden="true"></div>`)
    .join("");
}

// Delay a function until input stops for `wait` ms. Used for the search box.
export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// Escape user/API text before injecting it into innerHTML.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Format large numbers compactly: 1234 -> 1.2k.
export function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

// Refresh every "Saved" count pill in the nav.
export function updateSavedCount() {
  qsa("#saved-count").forEach((el) => {
    el.textContent = getSavedCount();
  });
}

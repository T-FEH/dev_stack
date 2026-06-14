// Saved page: render bookmarked repos and articles, with per-item removal.

import { repoCardTemplate } from "./github.mjs";
import { articleCardTemplate } from "./news.mjs";
import { initModal } from "./modal.mjs";
import { getSaved, removeItem } from "./storage.mjs";
import { qs, renderEmptyState, escapeHtml, updateSavedCount } from "./ui.mjs";

const feed = qs("#saved-feed");

// Reuse the feed card templates, then append a source tag + remove button.
function savedCardTemplate(item) {
  const inner =
    item.type === "repo" ? repoCardTemplate(item) : articleCardTemplate(item);
  const label = item.type === "repo" ? "Repo" : "Article";

  const controls = `
    <div class="saved-card-foot">
      <span class="source-tag">${label}</span>
      <button class="btn btn-danger" data-remove="${item.id}" aria-label="Remove ${escapeHtml(
    item.name || item.title
  )}">Remove</button>
    </div>
  `;
  return inner.replace(/<\/article>\s*$/, `${controls}</article>`);
}

function render() {
  const items = getSaved();
  updateSavedCount();

  const subtitle = qs("#saved-subtitle");
  if (subtitle) subtitle.textContent = items.length ? `${items.length} item${items.length !== 1 ? "s" : ""}` : "";

  if (!items.length) {
    renderEmptyState(feed, "Nothing saved yet. Bookmark repos and articles from the dashboard.");
    return;
  }
  feed.innerHTML = items.map(savedCardTemplate).join("");
}

function getRepoById(id) {
  return getSaved().find((item) => item.id === id);
}

function wireRemove() {
  feed.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    removeItem(btn.dataset.remove);
    render();
  });
}

function init() {
  render();
  wireRemove();
  initModal(getRepoById);
}

document.addEventListener("DOMContentLoaded", init);

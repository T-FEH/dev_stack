// Repo detail modal: open, close, and populate.

import { qs, escapeHtml, formatCount } from "./ui.mjs";
import { languageColor } from "./github.mjs";

let lastFocused = null;

function overlay() {
  return qs("#repo-modal");
}

// Format an ISO date as e.g. "14 Jun 2026".
function formatDate(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Unknown"
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function openModal(repo) {
  const el = overlay();
  if (!el) return;

  const topics = repo.topics.length
    ? repo.topics
        .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
        .join("")
    : '<span class="card-sub">No topics listed.</span>';

  const lang = repo.language
    ? `<span class="badge">
         <span class="lang-dot" style="background:${languageColor(repo.language)}"></span>
         ${escapeHtml(repo.language)}
       </span>`
    : "Not specified";

  qs("#modal-body").innerHTML = `
    <h3 id="modal-title">${escapeHtml(repo.fullName)}</h3>
    <p class="card-desc">${escapeHtml(repo.description) || "No description provided."}</p>

    <div class="tag-row">${topics}</div>

    <dl class="modal-meta">
      <dt>Language</dt><dd>${lang}</dd>
      <dt>License</dt><dd>${escapeHtml(repo.license)}</dd>
      <dt>Watchers</dt><dd>${formatCount(repo.watchers)}</dd>
      <dt>Stars</dt><dd>${formatCount(repo.stars)}</dd>
      <dt>Last updated</dt><dd>${formatDate(repo.updatedAt)}</dd>
    </dl>

    <a class="btn" href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">
      View on GitHub →
    </a>
  `;

  lastFocused = document.activeElement;
  el.hidden = false;
  qs(".modal-close", el)?.focus();
}

export function closeModal() {
  const el = overlay();
  if (!el || el.hidden) return;
  el.hidden = true;
  if (lastFocused) lastFocused.focus();
}

// Wire up close interactions once. Pass a lookup so a card id resolves to a repo.
export function initModal(getRepoById) {
  const el = overlay();
  if (!el) return;

  // Close on the X button or by clicking the backdrop (but not the dialog).
  el.addEventListener("click", (e) => {
    if (e.target === el || e.target.closest(".modal-close")) {
      closeModal();
    }
  });

  // Close on Escape.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Open when a repo card is clicked (but ignore clicks on the save button).
  document.addEventListener("click", (e) => {
    if (e.target.closest(".save-btn")) return;
    const card = e.target.closest('.card[data-type="repo"]');
    if (!card) return;
    const repo = getRepoById(card.dataset.id);
    if (repo) openModal(repo);
  });
}

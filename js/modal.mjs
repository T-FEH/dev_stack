// Repo detail modal: open, close, and populate.

import { qs, escapeHtml, formatCount } from "./ui.mjs";
import { languageColor } from "./github.mjs";

let lastFocused = null;

function overlay() {
  return qs("#repo-modal");
}

function formatDate(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Unknown"
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function openModal(repo) {
  const el = overlay();
  if (!el) return;

  const topics = repo.topics.length
    ? repo.topics.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")
    : `<span class="card-owner" style="font-size:0.8rem">No topics listed.</span>`;

  const lang = repo.language
    ? `<span class="badge">
         <span class="lang-dot" style="background:${languageColor(repo.language)}"></span>
         ${escapeHtml(repo.language)}
       </span>`
    : `<span style="color:var(--text-2)">Not specified</span>`;

  // Header zone: repo name + owner + description
  qs("#modal-header-zone").innerHTML = `
    <h3 id="modal-title">${escapeHtml(repo.fullName)}</h3>
    <p class="modal-desc">${escapeHtml(repo.description) || "No description provided."}</p>
  `;

  // Body zone: topics, metadata, link
  qs("#modal-body").innerHTML = `
    ${repo.topics.length ? `<div class="tag-row" style="margin-bottom:18px">${topics}</div>` : ""}

    <dl class="modal-meta">
      <dt>Language</dt>  <dd>${lang}</dd>
      <dt>License</dt>   <dd>${escapeHtml(repo.license)}</dd>
      <dt>Watchers</dt>  <dd>${formatCount(repo.watchers)}</dd>
      <dt>Stars</dt>     <dd>${formatCount(repo.stars)}</dd>
      <dt>Updated</dt>   <dd>${formatDate(repo.updatedAt)}</dd>
    </dl>

    <a class="btn" href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">
      View on GitHub &rarr;
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

export function initModal(getRepoById) {
  const el = overlay();
  if (!el) return;

  el.addEventListener("click", (e) => {
    if (e.target === el || e.target.closest(".modal-close")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".save-btn")) return;
    const card = e.target.closest('.card[data-type="repo"]');
    if (!card) return;
    const repo = getRepoById(card.dataset.id);
    if (repo) openModal(repo);
  });
}

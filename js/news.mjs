// Dev.to data: fetching, transform, and the article card template.

import { isSaved } from "./storage.mjs";
import { escapeHtml, formatCount } from "./ui.mjs";

const API = "https://dev.to/api/articles";

// Trim the raw API object down to what the UI needs.
export function transformArticle(article) {
  return {
    id: `article:${article.id}`,
    type: "article",
    title: article.title || "",
    author: article.user?.name || "Unknown author",
    avatar: article.user?.profile_image_90 || "",
    readingTime: article.reading_time_minutes || 1,
    tags: article.tag_list || [],
    reactions: article.public_reactions_count || 0,
    comments: article.comments_count || 0,
    url: article.url || "",
  };
}

// Fetch top articles for a time window. `top` is the number of days (1, 7, 30).
export async function fetchArticles(top = 7) {
  const url = `${API}?top=${top}&per_page=20`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Dev.to request failed (${response.status}).`);
  }

  const json = await response.json();
  return json.map(transformArticle);
}

// HTML for one article card.
export function articleCardTemplate(article) {
  const saved = isSaved(article.id);
  const tags = article.tags
    .slice(0, 4)
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join("");

  return `
    <article class="card" data-id="${article.id}" data-type="article">
      <div class="card-title">
        <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(article.title)}
        </a>
      </div>

      <div class="article-meta">
        <img
          class="avatar-sm"
          src="${escapeHtml(article.avatar)}"
          alt=""
          loading="lazy"
        />
        <span>${escapeHtml(article.author)}</span>
        <span class="meta-sep">|</span>
        <span>${article.readingTime} min read</span>
        <span class="meta-sep">|</span>
        <span><span class="stat-heart">♥</span> ${formatCount(article.reactions)}</span>
      </div>

      ${tags ? `<div class="tag-row">${tags}</div>` : ""}

      <div class="card-foot">
        <div class="stats">
          <span class="stat">
            <span class="stat-comm">◎</span> ${formatCount(article.comments)} comments
          </span>
        </div>
        <button
          class="save-btn ${saved ? "is-saved" : ""}"
          data-save="${article.id}"
          aria-label="${saved ? "Remove from saved" : "Save article"}"
          aria-pressed="${saved}"
        >${saved ? "✓ Saved" : "+ Save"}</button>
      </div>
    </article>
  `;
}

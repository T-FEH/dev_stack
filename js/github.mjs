// GitHub data: fetching (with a 1-hour cache), transform, and the repo card template.

import languageColors from "../data/languages.json";
import { getLocalStorage, setLocalStorage, isSaved } from "./storage.mjs";
import { escapeHtml, formatCount } from "./ui.mjs";

const CACHE_KEY = "devstack:repos";
const ONE_HOUR = 60 * 60 * 1000;
const API = "https://api.github.com/search/repositories";

// Date string (YYYY-MM-DD) for N days before today.
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Trim the raw API object down to what the UI needs.
export function transformRepo(repo) {
  return {
    id: `repo:${repo.id}`,
    type: "repo",
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner?.login || "",
    avatar: repo.owner?.avatar_url || "",
    language: repo.language || "",
    description: repo.description || "",
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    issues: repo.open_issues_count || 0,
    watchers: repo.watchers_count || 0,
    topics: repo.topics || [],
    license: repo.license?.name || "No license",
    updatedAt: repo.updated_at || "",
    url: repo.html_url || "",
  };
}

// Fetch trending repos created in the last week, sorted by stars.
// Served from localStorage if the cache is under an hour old.
export async function fetchRepos() {
  const cached = getLocalStorage(CACHE_KEY);
  if (cached && Date.now() - cached.timestamp < ONE_HOUR) {
    return cached.data;
  }

  const query = `created:>${daysAgo(7)}`;
  const url = `${API}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    // Most common failure here is the 60 req/hour unauthenticated rate limit.
    if (response.status === 403) {
      throw new Error("GitHub rate limit reached. Try again in a little while.");
    }
    throw new Error(`GitHub request failed (${response.status}).`);
  }

  const json = await response.json();
  const data = (json.items || []).map(transformRepo);
  setLocalStorage(CACHE_KEY, { timestamp: Date.now(), data });
  return data;
}

// Look up a language's badge color, falling back to a neutral gray.
export function languageColor(language) {
  return languageColors[language] || "#8b97b2";
}

// HTML for one repo card.
export function repoCardTemplate(repo) {
  const saved = isSaved(repo.id);
  const langBadge = repo.language
    ? `<span class="badge">
         <span class="lang-dot" style="background:${languageColor(repo.language)}"></span>
         ${escapeHtml(repo.language)}
       </span>`
    : "";

  return `
    <article class="card clickable" data-id="${repo.id}" data-type="repo">
      <div class="card-name-row">
        <img
          src="${escapeHtml(repo.avatar)}"
          alt=""
          class="avatar-sm"
          loading="lazy"
          style="border-radius:4px;width:18px;height:18px;"
        />
        <span class="card-owner-prefix">${escapeHtml(repo.owner)} /</span>
        <span class="card-name">${escapeHtml(repo.name)}</span>
        ${langBadge}
      </div>

      <p class="card-desc">${escapeHtml(repo.description) || "No description provided."}</p>

      <div class="card-foot">
        <div class="stats">
          <span class="stat" title="Stars">
            <span class="stat-star">★</span> ${formatCount(repo.stars)}
          </span>
          <span class="stat" title="Forks">
            <span class="stat-fork">⑂</span> ${formatCount(repo.forks)}
          </span>
          <span class="stat" title="Open issues">
            Open: ${formatCount(repo.issues)}
          </span>
        </div>
        <button
          class="save-btn ${saved ? "is-saved" : ""}"
          data-save="${repo.id}"
          aria-label="${saved ? "Remove from saved" : "Save repository"}"
          aria-pressed="${saved}"
        >${saved ? "✓ Saved" : "+ Save"}</button>
      </div>
    </article>
  `;
}

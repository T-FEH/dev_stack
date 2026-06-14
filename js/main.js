// Dashboard entry point: fetch both feeds, render, and wire up all interactions.

import { fetchRepos, repoCardTemplate } from "./github.mjs";
import { fetchArticles, articleCardTemplate } from "./news.mjs";
import { filterBySearch, filterByLanguage } from "./filter.mjs";
import { initModal } from "./modal.mjs";
import { saveItem, removeItem, isSaved } from "./storage.mjs";
import {
  qs,
  qsa,
  renderListWithTemplate,
  renderEmptyState,
  renderError,
  renderLoading,
  debounce,
  updateSavedCount,
} from "./ui.mjs";

// In-memory copies of the full fetched data sets. All filtering works off these.
const state = {
  repos: [],
  articles: [],
  searchTerm: "",
  language: "",
};

const githubFeed = qs("#github-feed");
const newsFeed = qs("#news-feed");

// --- Rendering ---

function renderRepos() {
  let list = filterByLanguage(state.repos, state.language);
  list = filterBySearch(list, state.searchTerm, ["name", "description", "fullName"]);

  if (!list.length) {
    renderEmptyState(githubFeed, "No repositories match your filters.");
    return;
  }
  renderListWithTemplate(repoCardTemplate, githubFeed, list);
}

function renderArticles() {
  const list = filterBySearch(state.articles, state.searchTerm, ["title", "tags", "author"]);

  if (!list.length) {
    renderEmptyState(newsFeed, "No articles match your search.");
    return;
  }
  renderListWithTemplate(articleCardTemplate, newsFeed, list);
}

// Populate the language dropdown from the languages actually present in the data.
function populateLanguageFilter() {
  const select = qs("#language-filter");
  if (!select) return;
  const langs = [...new Set(state.repos.map((r) => r.language).filter(Boolean))].sort();
  for (const lang of langs) {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    select.appendChild(option);
  }
}

// --- Data loading ---

async function loadRepos() {
  renderLoading(githubFeed);
  try {
    state.repos = await fetchRepos();
    populateLanguageFilter();
    renderRepos();
  } catch (err) {
    renderError(githubFeed, err.message || "Could not load repositories.");
  }
}

async function loadArticles(top = 1) {
  renderLoading(newsFeed);
  try {
    state.articles = await fetchArticles(top);
    renderArticles();
  } catch (err) {
    renderError(newsFeed, err.message || "Could not load articles.");
  }
}

// --- Lookups for the modal ---

function getRepoById(id) {
  return state.repos.find((r) => r.id === id);
}

// --- Event wiring ---

function wireSearch() {
  const input = qs("#global-search");
  if (!input) return;
  const onInput = debounce((e) => {
    state.searchTerm = e.target.value;
    renderRepos();
    renderArticles();
  }, 300);
  input.addEventListener("input", onInput);
}

function wireLanguageFilter() {
  const select = qs("#language-filter");
  if (!select) return;
  select.addEventListener("change", (e) => {
    state.language = e.target.value;
    renderRepos();
  });
}

function wireTimeTabs() {
  const tabs = qsa(".tabs .tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      loadArticles(Number(tab.dataset.top));
    });
  });
}

// Toggle a card's save button and update the saved store + nav count.
function wireSaveButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".save-btn");
    if (!btn) return;

    const id = btn.dataset.save;
    const item =
      getRepoById(id) || state.articles.find((a) => a.id === id);
    if (!item) return;

    if (isSaved(id)) {
      removeItem(id);
      btn.classList.remove("is-saved");
      btn.textContent = "☆";
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute(
        "aria-label",
        item.type === "repo" ? "Save repository" : "Save article"
      );
    } else {
      saveItem(item);
      btn.classList.add("is-saved");
      btn.textContent = "★";
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "Remove from saved");
    }
    updateSavedCount();
  });
}

// Mobile-only tabs to switch which feed is visible.
function wireFeedSwitch() {
  const buttons = qsa(".feed-switch-btn");
  const columns = {
    github: qs("#github-column"),
    news: qs("#news-column"),
  };

  // Match the default active button ("Repos"). The CSS only acts on this class
  // at the mobile breakpoint, so desktop still shows both columns.
  columns.news?.classList.add("is-hidden");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const target = btn.dataset.feed;
      Object.entries(columns).forEach(([key, col]) => {
        col?.classList.toggle("is-hidden", key !== target);
      });
    });
  });
}

function init() {
  updateSavedCount();
  wireSearch();
  wireLanguageFilter();
  wireTimeTabs();
  wireSaveButtons();
  wireFeedSwitch();
  initModal(getRepoById);

  loadRepos();
  loadArticles(1);
}

document.addEventListener("DOMContentLoaded", init);

# DevStack

A frontend developer dashboard that combines trending GitHub repositories and Dev.to tech articles into a single, clean interface. Built as a school project for a frontend development course.

**Live site:** https://t-feh.github.io/dev_stack/

---

## Features

- **GitHub trending feed** — fetches repositories created in the last 7 days, sorted by stars. Results are cached in `localStorage` for one hour so the page never burns through the 60 req/hour unauthenticated rate limit on repeat visits.
- **Dev.to article feed** — top articles from Dev.to with a time filter: Today, This Week, This Month. Switching tabs refetches with an updated `top` parameter.
- **Language filter** — a dropdown above the GitHub feed that filters repos client-side by programming language. No extra network request.
- **Global search** — a single search bar in the header filters both feeds simultaneously on every keystroke, debounced at 300 ms. Matches repo names, descriptions, article titles, tags, and author names.
- **Bookmarks** — every card has a `+ Save` button that writes the item to a `localStorage` array. The saved count in the nav updates immediately.
- **Saved page** — `saved.html` reads the bookmark array and renders all saved items, each with a Remove button.
- **Repo detail modal** — clicking a repo card opens a modal showing topics, license, watcher count, last updated date, and a link to the repository on GitHub.
- **Language badge colors** — `data/languages.json` maps language names to hex colors used on each repo card badge.
- **Responsive layout** — two-column grid on desktop, single-column with tab switching on mobile. A fixed bottom nav bar replaces the header nav on small screens.

---

## Tech stack

| Concern | Choice |
|---|---|
| Build tool | [Vite 5](https://vitejs.dev) |
| Language | Vanilla JavaScript — ES modules (`.mjs`) |
| Styling | Plain CSS with custom properties |
| APIs | GitHub REST API, Dev.to public API |
| Persistence | `localStorage` |
| Fonts | Inter, JetBrains Mono (Google Fonts) |
| Deployment | GitHub Pages via GitHub Actions |

No frameworks, no libraries, no runtime dependencies.

---

## Project structure

```
dev_stack/
├── index.html              # Dashboard (two-column layout)
├── saved.html              # Bookmarks page
├── css/
│   └── style.css           # All styles, CSS custom properties
├── js/
│   ├── main.js             # Entry point — wires up all interactions
│   ├── github.mjs          # GitHub fetch, transform, card template
│   ├── news.mjs            # Dev.to fetch, transform, card template
│   ├── storage.mjs         # localStorage helpers + bookmark CRUD
│   ├── ui.mjs              # Shared DOM helpers (render, debounce, etc.)
│   ├── filter.mjs          # Pure filter functions (search, language)
│   ├── modal.mjs           # Repo detail modal logic
│   └── saved.js            # Entry point for saved.html
├── data/
│   └── languages.json      # Language → hex color map
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD — build and deploy to GitHub Pages
├── vite.config.js          # Multi-page Vite config
└── package.json
```

---

## APIs

### GitHub REST API
```
GET https://api.github.com/search/repositories
    ?q=created:>YYYY-MM-DD&sort=stars&order=desc&per_page=30
```
- No authentication required (60 requests/hour unauthenticated)
- Response is cached in `localStorage` with a timestamp — refetched only when the cache is older than one hour
- Rate limit errors (HTTP 403) show a user-facing message instead of crashing

### Dev.to public API
```
GET https://dev.to/api/articles?top=<1|7|30>&per_page=20
```
- No authentication required
- `top` parameter controls the time window (1 = today, 7 = this week, 30 = this month)
- Refetched on every tab switch

---

## Module responsibilities

| Module | Exports |
|---|---|
| `storage.mjs` | `getLocalStorage`, `setLocalStorage`, `getSaved`, `saveItem`, `removeItem`, `isSaved` |
| `ui.mjs` | `qs`, `qsa`, `renderListWithTemplate`, `renderEmptyState`, `renderError`, `renderLoading`, `debounce`, `escapeHtml`, `formatCount`, `updateSavedCount` |
| `github.mjs` | `fetchRepos`, `transformRepo`, `repoCardTemplate`, `languageColor` |
| `news.mjs` | `fetchArticles`, `transformArticle`, `articleCardTemplate` |
| `filter.mjs` | `filterBySearch`, `filterByLanguage` |
| `modal.mjs` | `openModal`, `closeModal`, `initModal` |

---

## Running locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Preview the production build
npm run preview
```

Requires Node 18 or later.

---

## Deployment

Pushing to the `main` branch triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which:

1. Checks out the repository
2. Installs dependencies with `npm ci`
3. Runs `npm run build` with `BASE_URL=/dev_stack/` so asset paths resolve correctly under the GitHub Pages subdirectory
4. Deploys the `dist/` folder to GitHub Pages

To enable this on a fork or new repo, go to **Settings → Pages → Source** and select **GitHub Actions**.

---

## Design

The UI uses a warm dark brown palette defined entirely through CSS custom properties:

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#171410` | Page background |
| `--surface` | `#1f1c17` | Card and panel background |
| `--header` | `#110f0c` | Header and footer bar |
| `--accent` | `#bf7d4e` | Logo, active states, save button |
| `--text` | `#ede6db` | Primary text |
| `--text-2` | `#7d6e5f` | Secondary/muted text |
| `--border` | `#2c2519` | Card and element borders |

Changing a color means updating one variable in `:root`.

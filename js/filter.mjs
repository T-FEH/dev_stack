// Pure client-side filtering. No network calls.

// Keep items whose chosen text fields contain the search term.
// `fields` lists the property names to match against; array values (e.g. tags)
// are joined before matching.
export function filterBySearch(items, term, fields) {
  const q = term.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      const text = Array.isArray(value) ? value.join(" ") : value;
      return String(text || "").toLowerCase().includes(q);
    })
  );
}

// Keep repos matching a language. Empty language means "all".
export function filterByLanguage(repos, language) {
  if (!language) return repos;
  return repos.filter((repo) => repo.language === language);
}

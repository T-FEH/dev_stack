// Thin wrapper around localStorage with JSON handling plus bookmark helpers.

const SAVED_KEY = "devstack:saved";

// Read a JSON value. Returns null if missing or unparseable.
export function getLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

// Write a JSON value. Returns true on success.
export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// --- Bookmarks ---

// Every saved item carries a unique `id` (e.g. "repo:1234" or "article:567").
export function getSaved() {
  return getLocalStorage(SAVED_KEY) || [];
}

export function isSaved(id) {
  return getSaved().some((item) => item.id === id);
}

// Add an item if it is not already saved. Returns the new list.
export function saveItem(item) {
  const list = getSaved();
  if (!list.some((i) => i.id === item.id)) {
    list.push(item);
    setLocalStorage(SAVED_KEY, list);
  }
  return list;
}

// Remove a single item by id. Returns the new list.
export function removeItem(id) {
  const list = getSaved().filter((item) => item.id !== id);
  setLocalStorage(SAVED_KEY, list);
  return list;
}

export function getSavedCount() {
  return getSaved().length;
}

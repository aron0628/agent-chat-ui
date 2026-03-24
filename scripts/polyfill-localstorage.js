// Polyfill for Node.js 21+ broken experimental localStorage
// Node.js exposes localStorage but without standard Web API methods (getItem, setItem, etc.)
// This causes nuqs and other libraries to crash during SSR.
if (
  typeof globalThis.localStorage !== "undefined" &&
  typeof globalThis.localStorage.getItem !== "function"
) {
  const store = new Map();
  globalThis.localStorage = {
    getItem(k) { return store.get(k) ?? null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); },
    get length() { return store.size; },
    key(i) { return [...store.keys()][i] ?? null; },
  };
}

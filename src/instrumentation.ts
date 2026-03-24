export async function register() {
  // Node.js 21+ has an experimental localStorage that lacks standard Web API methods.
  // This causes nuqs and other libraries to crash during SSR.
  // Polyfill with a Map-backed implementation if the native one is broken.
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    const storage = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
      get length() {
        return storage.size;
      },
      key: (index: number) => [...storage.keys()][index] ?? null,
    } as Storage;
  }
}

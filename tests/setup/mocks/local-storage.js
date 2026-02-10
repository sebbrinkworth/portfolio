export function createLocalStorageMock() {
  const storage = new Map();
  
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index) => Array.from(storage.keys())[index] ?? null,
    _storage: storage, // Access for testing
  };
}

export interface LocalStorageMock {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
  key(index: number): string | null;
  _storage: Map<string, string>;
}

export function createLocalStorageMock(): LocalStorageMock {
  const storage = new Map<string, string>();
  
  return {
    getItem: (key: string): string | null => storage.get(key) ?? null,
    setItem: (key: string, value: string): void => { storage.set(key, String(value)); },
    removeItem: (key: string): void => { storage.delete(key); },
    clear: (): void => { storage.clear(); },
    get length(): number { return storage.size; },
    key: (index: number): string | null => Array.from(storage.keys())[index] ?? null,
    _storage: storage, // Access for testing
  };
}

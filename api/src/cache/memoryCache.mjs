export function createMemoryCache({ ttlSeconds }) {
  const store = new Map();

  async function getOrSet(key, loader) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value;
    }

    const value = await loader();
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    return value;
  }

  function clear() {
    store.clear();
  }

  return { getOrSet, clear };
}

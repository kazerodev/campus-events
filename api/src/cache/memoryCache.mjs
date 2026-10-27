export function createMemoryCache({ ttlSeconds }) {
  const store = new Map();
  let version = 0;

  async function getOrSet(key, loader) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value;
    }

    const versionAtStart = version;
    const value = await loader();

    // If something changed while we were loading, this value can already be old.
    if (version === versionAtStart) {
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    return value;
  }

  function clear() {
    version++;
    store.clear();
  }

  return { getOrSet, clear };
}

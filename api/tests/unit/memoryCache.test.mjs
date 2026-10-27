import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMemoryCache } from '../../src/cache/memoryCache.mjs';

describe('memory cache', () => {
  it('calls the loader only once while the value is fresh', async () => {
    const cache = createMemoryCache({ ttlSeconds: 60 });
    let calls = 0;
    const load = async () => ++calls;

    await cache.getOrSet('key', load);
    const value = await cache.getOrSet('key', load);

    assert.equal(value, 1);
    assert.equal(calls, 1);
  });

  it('loads again after the value expired', async (t) => {
    t.mock.timers.enable({ apis: ['Date'] });
    const cache = createMemoryCache({ ttlSeconds: 30 });
    let calls = 0;
    const load = async () => ++calls;

    await cache.getOrSet('key', load);
    t.mock.timers.tick(31 * 1000);
    const value = await cache.getOrSet('key', load);

    assert.equal(value, 2);
  });

  it('loads again after clear()', async () => {
    const cache = createMemoryCache({ ttlSeconds: 60 });
    let calls = 0;
    const load = async () => ++calls;

    await cache.getOrSet('key', load);
    cache.clear();
    const value = await cache.getOrSet('key', load);

    assert.equal(value, 2);
  });

  it('does not keep a value that was loaded while the cache was cleared', async () => {
    const cache = createMemoryCache({ ttlSeconds: 60 });
    let finishLoad;
    const slowLoad = () => new Promise((resolve) => { finishLoad = resolve; });

    const pending = cache.getOrSet('key', slowLoad);
    cache.clear();
    finishLoad('old value');
    await pending;
    const value = await cache.getOrSet('key', async () => 'new value');

    assert.equal(value, 'new value');
  });

  it('does not cache a loader that throws', async () => {
    const cache = createMemoryCache({ ttlSeconds: 60 });

    await assert.rejects(cache.getOrSet('key', async () => { throw new Error('db down'); }));
    const value = await cache.getOrSet('key', async () => 'ok');

    assert.equal(value, 'ok');
  });
});

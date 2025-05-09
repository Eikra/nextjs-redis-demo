const { getOrSetCache, getRedisClient } = require('../lib/redis');
const fetch = require('node-fetch');
const { promisify } = require('util');

jest.setTimeout(30000); // Increase timeout for Redis and API calls

describe('Redis Caching', () => {
  let client;

  beforeAll(async () => {
    client = await getRedisClient();
    await client.flushDb(); // Clear Redis before tests
  });

  afterAll(async () => {
    await client.quit();
  });

  test('getOrSetCache caches API response', async () => {
    const cacheKey = 'test:posts:page:1';
    const fetchSpy = jest.spyOn(global, 'fetch');

    // First call: Should fetch from API and cache
    const data = await getOrSetCache(cacheKey, async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      return response.json();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(100); // JSONPlaceholder returns 100 posts

    // Second call: Should return cached data
    const cachedData = await getOrSetCache(cacheKey, async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      return response.json();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1); // No additional API call
    expect(cachedData).toEqual(data);

    // Verify data is in Redis
    const redisData = await client.get(cacheKey);
    expect(JSON.parse(redisData)).toEqual(data);
  });

  test('getOrSetCache sets 1-hour TTL', async () => {
    const cacheKey = 'test:posts:page:2';
    await getOrSetCache(cacheKey, async () => {
      return [{ id: 1, title: 'Test Post' }];
    });

    const ttl = await client.ttl(cacheKey);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(3600); // 1-hour TTL
  });

  test('Cache handles frequent updates', async () => {
    const cacheKey = 'test:posts:page:3';
    const firstData = [{ id: 1, title: 'First Post' }];
    const updatedData = [{ id: 1, title: 'Updated Post' }];

    // Cache first data
    await getOrSetCache(cacheKey, async () => firstData);

    // Verify first data
    let cached = await client.get(cacheKey);
    expect(JSON.parse(cached)).toEqual(firstData);

    // Simulate update by clearing cache and setting new data
    await client.del(cacheKey);
    await getOrSetCache(cacheKey, async () => updatedData);

    // Verify updated data
    cached = await client.get(cacheKey);
    expect(JSON.parse(cached)).toEqual(updatedData);
  });
});

describe('Posts Page Caching', () => {
  test('Subsequent requests use cache with low latency', async () => {
    const url = 'http://localhost:3000/posts?page=1';
    const startTime1 = Date.now();
    const res1 = await fetch(url);
    const time1 = Date.now() - startTime1;
    const data1 = await res1.json();

    const startTime2 = Date.now();
    const res2 = await fetch(url);
    const time2 = Date.now() - startTime2;
    const data2 = await res2.json();

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(data1).toEqual(data2); // Same data from cache
    expect(time2).toBeLessThan(time1); // Cached request is faster
    expect(time2).toBeLessThan(100); // Cached request < 100ms
  });
});
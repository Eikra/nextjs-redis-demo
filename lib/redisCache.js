import Redis from 'ioredis';
const redis = new Redis();
export async function cacheData(key, fetchData) {
  const cachedData = await redis.get(key);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  } else {
    const freshData = await fetchData();
    await redis.set(key, JSON.stringify(freshData), 'EX', 60 * 5); // Cache for 5 minutes
    return freshData;
  }
}
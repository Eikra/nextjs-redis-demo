import { createClient } from 'redis';

let client;

export async function getRedisClient() {
  if (!client) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is required');
    }
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    });
    client.on('error', (err) => console.error('Redis Client Error:', err));
    await client.connect();
  }
  return client;
}

export async function getOrSetCache(key, cb) {
  const client = await getRedisClient();
  const cached = await client.get(key);
  if (cached) {
    console.log(`Cache hit for key: ${key}`);
    return JSON.parse(cached);
  }

  console.log(`Cache miss for key: ${key}`);
  const data = await cb();
  await client.setEx(key, 3600, JSON.stringify(data)); // 1-hour TTL
  return data;
}

export async function addToPostStream(post) {
  const client = await getRedisClient();
  await client.xAdd('posts:stream', '*', {
    id: post.id.toString(),
    title: post.title,
    body: post.body || '',
  });
}

export async function readPostStream(lastId = '$', count = 10) {
  const client = await getRedisClient();
  const results = await client.xRead(
    [{ key: 'posts:stream' }],
    lastId,
    { COUNT: count }
  );
  if (!results) return [];
  return results[0].messages.map((msg) => ({
    id: msg.id,
    ...msg.message,
  }));
}
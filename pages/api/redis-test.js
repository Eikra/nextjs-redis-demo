// pages/api/redis-test.js
import { createClient } from 'redis';

export default async function handler(req, res) {
  const client = createClient({ url: process.env.REDIS_URL });
  
  try {
    await client.connect();
    await client.set('test', 'Redis is working!');
    const value = await client.get('test');
    res.status(200).json({ status: 'success', value });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    await client.quit();
  }
}
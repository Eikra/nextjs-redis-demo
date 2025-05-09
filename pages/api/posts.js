import { getOrSetCache } from '../../lib/redis';

export default async function handler(req, res) {
  const { page = 1, limit = 5 } = req.query;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);

  try {
    const posts = await getOrSetCache(`api:posts:${page}:${limit}`, async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const data = await response.json();
      return data.slice(start, end); // Simulate pagination
    }, 3600);

    res.status(200).json(posts);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}
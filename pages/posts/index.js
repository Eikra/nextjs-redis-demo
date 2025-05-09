import Link from 'next/link';
import { getOrSetCache } from '../../lib/redis';

const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_POSTS_LIMIT || '10', 10);

export default function PostsPage({ posts, page, totalPages, limit }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Server-Side Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="border p-4 rounded">
            <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={`/posts?page=${page - 1}&limit=${limit}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Previous
          </Link>
        ) : <div />}

        {page < totalPages && (
          <Link href={`/posts?page=${page + 1}&limit=${limit}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Next
          </Link>
        )}
      </div>

      <p className="mt-4">
        Page {page} of {totalPages} (Showing {posts.length} of {limit} posts per page)
      </p>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || DEFAULT_LIMIT, 10);
  const start = (page - 1) * limit;

  const cacheKey = `posts:page:${page}:limit:${limit}`;

  const posts = await getOrSetCache(cacheKey, async () => {
    const response = await fetch(`${process.env.API_BASE_URL}/posts`);
    const allPosts = await response.json();
    return allPosts.slice(start, start + limit);
  });

  const totalPosts = 100; // known from JSONPlaceholder
  const totalPages = Math.ceil(totalPosts / limit);

  return {
    props: {
      posts: Array.isArray(posts) ? posts : [],
      page,
      limit,
      totalPages,
    },
  };
}


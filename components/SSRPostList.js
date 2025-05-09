import Link from 'next/link';

export default function SSRPostList({ posts }) {
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="border p-4 rounded">
          <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

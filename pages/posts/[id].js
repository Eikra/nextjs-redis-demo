'use client';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import ErrorBoundary from '../../components/ErrorBoundary';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
};

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: post, error, isLoading } = useSWR(
    id ? `/api/posts/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  if (!id) return <div>Loading...</div>;

  return (
    <ErrorBoundary fallback={<div>Failed to load post. Please try again.</div>}>
      <div className="container mx-auto p-4">
        {isLoading && <div>Loading post...</div>}
        {error && <div>Failed to load post.</div>}
        {post && (
          <>
            <Link href="/posts" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Posts
            </Link>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-700">{post.body}</p>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
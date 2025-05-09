'use client'; // Ensure client-side rendering
import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import ErrorBoundary from './ErrorBoundary'; // New component for error handling

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

export default function PostList() {
  const [page, setPage] = useState(1);
  const postsPerPage = 10;

  const { data: posts, error, isLoading } = useSWR(
    `/api/posts?page=${page}&limit=${postsPerPage}`,
    fetcher,
    {
      revalidateOnFocus: false, // Prevent revalidation on window focus
      dedupingInterval: 60000, // Dedupe requests within 60s
      keepPreviousData: true, // Keep previous data while fetching new page
      fallbackData: [], // Avoid undefined state
    }
  );

  return (
    <ErrorBoundary fallback={<div>Failed to load posts. Please try again later.</div>}>
      <div className="mt-6">
        <h2 className="text-2xl font-bold">Client-Side Posts</h2>
        {isLoading && <div>Loading posts...</div>}
        {!isLoading && posts.length === 0 && <div>No posts available.</div>}
        <ul className="mt-4 space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={posts.length < postsPerPage}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        
      </div>
    </ErrorBoundary>
  );
}
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import PostList to reduce initial bundle size
const PostList = dynamic(() => import('../components/PostList'), {
  ssr: false, // Disable SSR for client-side component
  loading: () => <p>Loading posts...</p>,
});

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Next.js Redis Demo</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Server-Side Rendered Content</h2>
        <Link href="/posts" className="text-blue-600 hover:underline">
          View Posts (SSR)
        </Link>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Client-Side Rendered Content</h2>
        <PostList />
      </section>
    </div>
  );
}
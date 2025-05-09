import Link from 'next/link';

export default function Pagination({ page, totalPages, limit, basePath }) {
  return (
    <div className="mt-6 flex justify-between">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}&limit=${limit}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Previous
          </button>
        </Link>
      ) : <div />}

      {page < totalPages && (
        <Link href={`${basePath}?page=${page + 1}&limit=${limit}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Next
          </button>
        </Link>
      )}
    </div>
  );
}

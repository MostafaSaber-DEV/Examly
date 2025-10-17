'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Something went wrong!
            </h2>
            <p className='text-gray-600 mb-6'>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors'
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

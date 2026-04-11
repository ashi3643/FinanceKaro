export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-4 py-2 bg-accent text-white rounded-lg">
        Go Home
      </a>
    </div>
  );
}
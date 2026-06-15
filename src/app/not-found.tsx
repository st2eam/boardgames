export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold text-zinc-800">404</h1>
      <p className="text-lg text-zinc-600">Page not found</p>
      <a
        href="/en"
        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        Back to Home
      </a>
    </div>
  );
}

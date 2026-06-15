import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-heading text-7xl font-bold text-primary-dark/15">404</h1>
      <p className="text-lg text-stone-500">Page not found / 页面未找到</p>
      <Link
        href="/en"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
      >
        Back to Home / 返回首页
      </Link>
    </div>
  );
}

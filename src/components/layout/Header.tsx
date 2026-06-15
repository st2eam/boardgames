"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isZh = locale === "zh";
  const otherLocale = isZh ? "en" : "zh";
  const otherPath = pathname.replace(/^\/(zh|en)/, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="font-heading text-xl font-bold tracking-tight text-primary-dark hover:text-primary transition-colors"
        >
          {t("home.title")}
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href={otherPath}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-amber-50 hover:text-primary hover:border-amber-300 transition-colors"
            aria-label={t("common.language")}
          >
            {isZh ? t("common.english") : t("common.chinese")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

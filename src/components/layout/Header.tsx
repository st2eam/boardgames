"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const otherLocale = isZh ? "en" : "zh";
  const otherPath = pathname.replace(/^\/(zh|en)/, `/${otherLocale}`);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a
          href={`/${isZh ? "zh" : "en"}`}
          className="text-lg font-bold text-zinc-900 hover:text-zinc-700 transition-colors"
        >
          {isZh ? "桌游规则" : "Board Game Rules"}
        </a>
        <nav className="flex items-center gap-3">
          <a
            href={otherPath}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            {t("language")}: {isZh ? t("english") : t("chinese")}
          </a>
        </nav>
      </div>
    </header>
  );
}

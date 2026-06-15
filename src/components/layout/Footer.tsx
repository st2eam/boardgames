"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border bg-primary-light/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-stone-500">
          {t("home.title")}
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a
            href="https://github.com/st2eam/boardgames"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-500 hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

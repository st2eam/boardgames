import { GameRepository } from "@/lib/content/GameRepository";
import { DecisionTree } from "@/components/game/DecisionTree";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      const flow = await GameRepository.getFlowData(slug, locale);
      if (flow) {
        params.push({ locale, slug });
      }
    }
  }
  return params;
}

export default async function FlowPage({ params }: Props) {
  const { locale, slug } = await params;
  const flowData = await GameRepository.getFlowData(slug, locale);
  const meta = await GameRepository.getGameMeta(slug);

  if (!flowData || !meta) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <a
          href={`/${locale}/games/${slug}/`}
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {meta.name[locale as "en" | "zh"] ?? meta.name.en}
        </a>
      </div>
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
        {meta.name[locale as "en" | "zh"] ?? meta.name.en}
      </h1>
      <DecisionTree flowData={flowData} locale={locale} />
    </div>
  );
}

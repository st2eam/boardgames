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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <a
        href={`/${locale}/games/${slug}/`}
        className="mb-4 inline-block text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        &larr; {meta.name[locale as "en" | "zh"] ?? meta.name.en}
      </a>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        {meta.name[locale as "en" | "zh"] ?? meta.name.en} —{" "}
        {locale === "zh" ? "交互式流程" : "Decision Tree"}
      </h1>
      <DecisionTree flowData={flowData} locale={locale} />
    </div>
  );
}

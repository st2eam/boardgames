import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = (
    await import(`../../../messages/${locale}.json`)
  ).default;

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}";try{localStorage.setItem("preferred-locale","${locale}")}catch(e){}`,
        }}
      />
      <div className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </div>
    </NextIntlClientProvider>
  );
}

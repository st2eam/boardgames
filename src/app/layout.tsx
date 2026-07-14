import type { Metadata } from "next";
import { Fredoka, Nunito, Noto_Sans_SC } from "next/font/google";
import { SITE_NAME, SITE_URL, getDefaultOgImage } from "@/lib/seo";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sc",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description:
    "Bilingual board game rules reference — decision trees, score trackers, trainers, and AI Q&A.",
  applicationName: SITE_NAME,
  manifest: "/boardgames/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Game Shelf",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Bilingual board game rules reference — decision trees, score trackers, trainers, and AI Q&A.",
    url: SITE_URL,
    images: [{ url: getDefaultOgImage(), width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Bilingual board game rules reference — decision trees, score trackers, trainers, and AI Q&A.",
    images: [getDefaultOgImage()],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fredoka.variable} ${nunito.variable} ${notoSansSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/boardgames/icons/icon-180.png" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body className="min-h-full flex flex-col bg-surface">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator){window.addEventListener("load",function(){var hadController=!!navigator.serviceWorker.controller;var refreshing=false;navigator.serviceWorker.addEventListener("controllerchange",function(){if(!hadController){hadController=true;return}if(refreshing)return;refreshing=true;location.reload()});navigator.serviceWorker.register("/boardgames/sw.js").then(function(reg){function check(){reg.update()}document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")check()});setInterval(check,36e5)}).catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}

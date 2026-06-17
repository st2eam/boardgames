import type { Metadata } from "next";
import { Fredoka, Nunito, Noto_Sans_SC } from "next/font/google";
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
  title: "The Game Shelf",
  description: "Your curated collection of tabletop game rules",
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
      <body className="min-h-full flex flex-col bg-surface">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface">{children}</body>
    </html>
  );
}

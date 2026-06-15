import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Game Rules",
  description: "Quick reference for modern board games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50">{children}</body>
    </html>
  );
}

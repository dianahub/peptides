import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: { default: "Futurotek", template: "%s | Futurotek" },
  description: "Educational information about peptides and longevity research.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale().catch(() => "en");
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

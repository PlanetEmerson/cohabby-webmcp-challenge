import type { Metadata } from "next";
import { Outfit } from 'next/font/google';
import "./globals.css";

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://webmcp.cohabby.com'),
  title: 'CoHabby Living | Compatibility-first roommate finder',
  description: 'Use six WebMCP tools to explore fictional roommates, synthetic Synergy reads, home context, and a human-approved introduction.',
  applicationName: 'CoHabby Living',
  icons: { icon: '/assets/brand/cohabby-app-icon.png' },
  robots: { index: true, follow: true },
  other: { 'theme-color': '#FBF5F1' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans text-text-primary antialiased">{children}</body>
    </html>
  );
}

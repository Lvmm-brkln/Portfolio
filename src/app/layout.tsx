import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";
import { ImageModalProvider } from "@/components/ImageModalProvider";

const headingSerif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

const uiSans = Inter({
  subsets: ["latin"],
  variable: "--font-ui-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const metadataBase = siteUrl
  ? new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${site.name} — Visual Storytelling`,
    template: `%s — ${site.name}`,
  },
  description: site.subtitle,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingSerif.variable} ${uiSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <div className="flex min-h-full flex-col">
          <SiteHeader />
          <ImageModalProvider>{children}</ImageModalProvider>
        </div>
      </body>
    </html>
  );
}

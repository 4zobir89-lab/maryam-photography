import type { Metadata } from "next";
import { Playfair_Display, Inter, Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { LanguageProvider } from "@/components/shared/LanguageProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مريم | مصورة فوتوغرافية — Maryam Photography",
    template: "%s | مريم للتصوير",
  },
  description:
    "مريم — مصورة فوتوغرافية يمنية. بصريات سينمائية تلتقط الروح اليمنية والعالمية. صور أعراس، بورتريه، ثقافة، ومناظر طبيعية.",
  keywords: [
    "مريم",
    "مصورة يمنية",
    "تصوير فوتوغرافي",
    "Yemeni photographer",
    "cinematic photography",
    "wedding photography Yemen",
    "بورتريه",
    "تصوير أعراس",
  ],
  authors: [{ name: "Maryam" }],
  creator: "Maryam",
  publisher: "Maryam",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "مريم | مصورة فوتوغرافية",
    description: "بصريات سينمائية تلتقط الروح اليمنية والعالمية",
    type: "website",
    locale: "ar_YE",
    url: SITE_URL,
    siteName: "Maryam Photography",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "مريم | Maryam Photography — Yemeni Visual Storyteller",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مريم | مصورة فوتوغرافية",
    description: "بصريات سينمائية تلتقط الروح اليمنية والعالمية",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? { google: GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${playfair.variable} ${inter.variable} ${amiri.variable} ${tajawal.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          <SiteJsonLd />
          {children}
          <Toaster />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}

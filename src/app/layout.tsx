import type { Metadata } from "next";
import { Playfair_Display, Inter, Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
  title: "مريم | مصورة فوتوغرافية — Maryam Photography",
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
  openGraph: {
    title: "مريم | مصورة فوتوغرافية",
    description: "بصريات سينمائية تلتقط الروح اليمنية والعالمية",
    type: "website",
  },
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}

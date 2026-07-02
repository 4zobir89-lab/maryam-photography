"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  MessageCircle,
  Mail,
  ArrowUp,
  Heart,
  Code2,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  siteNameAr: string;
  siteNameEn?: string;
  footerDesc: string;
  footerCopyright: string;
  contactInstagram: string;
  contactWhatsapp: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

type FooterLink = { labelAr: string; labelEn: string; href: string };
type FooterColumn = {
  titleAr: string;
  titleEn: string;
  links: FooterLink[];
};

// Static columns (services + explore). The contact column is built dynamically
// from settings inside the component body.
const staticColumns: FooterColumn[] = [
  {
    titleAr: "الخدمات",
    titleEn: "Services",
    links: [
      { labelAr: "تصوير الأعراس", labelEn: "Weddings", href: "#services" },
      { labelAr: "بورتريه", labelEn: "Portraits", href: "#services" },
      { labelAr: "تصوير تجاري", labelEn: "Commercial", href: "#services" },
      { labelAr: "ورش العمل", labelEn: "Workshops", href: "#services" },
    ],
  },
  {
    titleAr: "الاستكشاف",
    titleEn: "Explore",
    links: [
      { labelAr: "الرئيسية", labelEn: "Home", href: "#home" },
      { labelAr: "عن مريم", labelEn: "About", href: "#about" },
      { labelAr: "الأعمال", labelEn: "Portfolio", href: "#portfolio" },
      { labelAr: "آراء العملاء", labelEn: "Testimonials", href: "#testimonials" },
      { labelAr: "المدونة", labelEn: "Blog", href: "/blog" },
      { labelAr: "المعرض الكامل", labelEn: "Full Gallery", href: "/gallery" },
    ],
  },
];

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);
  const { t } = useLang();

  // Newsletter form state
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {});
  }, []);

  const siteNameAr = s?.siteNameAr ?? "مريم";
  const siteNameEn = s?.siteNameEn ?? "Maryam";
  const footerDesc =
    s?.footerDesc ??
    "بصريات سينمائية من قلب صنعاء. أصوّر الحكايات قبل الأشخاص، وألتقط في كل إطار لحظة تستحق أن تُروى.";
  const footerCopyright =
    s?.footerCopyright ?? "© 2024 مريم. جميع الحقوق محفوظة.";

  const instagramHref =
    s?.contactInstagram && s.contactInstagram !== "#"
      ? s.contactInstagram.startsWith("http")
        ? s.contactInstagram
        : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`
      : "#";
  const whatsappHref =
    s?.contactWhatsapp && s.contactWhatsapp !== "#"
      ? s.contactWhatsapp.startsWith("http")
        ? s.contactWhatsapp
        : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`
      : "#";
  const emailHref = s?.contactEmail ? `mailto:${s.contactEmail}` : "#";
  const phoneHref = s?.contactPhone
    ? `tel:${s.contactPhone.replace(/[^+\d]/g, "")}`
    : "#";

  // Build the dynamic contact column from fetched settings.
  const contactColumn: FooterColumn = {
    titleAr: "تواصل",
    titleEn: "Connect",
    links: [
      {
        labelAr: s?.contactEmail || "hello@maryam.photo",
        labelEn: s?.contactEmail || "hello@maryam.photo",
        href: emailHref,
      },
      {
        labelAr: s?.contactPhone || "+967 77 123 4567",
        labelEn: s?.contactPhone || "+967 77 123 4567",
        href: phoneHref,
      },
      {
        labelAr: s?.contactAddress || "صنعاء القديمة",
        labelEn: s?.contactAddress || "Old Sana'a",
        href: "#",
      },
      { labelAr: "احجز جلسة", labelEn: "Book a Session", href: "/booking" },
    ],
  };

  const footerColumns: FooterColumn[] = [...staticColumns, contactColumn];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterState("loading");
    setNewsletterMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setNewsletterState("success");
        setNewsletterMsg("تم الاشتراك بنجاح!");
        setEmail("");
        setTimeout(() => {
          setNewsletterState("idle");
          setNewsletterMsg("");
        }, 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        setNewsletterState("error");
        setNewsletterMsg(
          data?.error || "تعذّر الاشتراك. حاول مرة أخرى لاحقًا."
        );
      }
    } catch {
      setNewsletterState("error");
      setNewsletterMsg("تعذّر الاتصال بالخادم. حاول مرة أخرى لاحقًا.");
    }
  };

  return (
    <footer className="relative bg-[oklch(0.04_0.005_285)] border-t border-border/40 pt-20 pb-8 overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        {/* Top: brand + links */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 44 44" className="w-12 h-12">
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="oklch(0.78 0.13 75)"
                  strokeWidth="1"
                />
                <text
                  x="22"
                  y="29"
                  textAnchor="middle"
                  className="font-display fill-[oklch(0.85_0.12_80)]"
                  fontSize="20"
                  fontWeight="700"
                >
                  M
                </text>
              </svg>
              <div>
                <div className="font-amiri text-2xl text-gold-gradient">
                  {t(siteNameAr, siteNameEn)}
                </div>
                <div className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  Maryam Photography
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-loose max-w-md">
              {footerDesc}
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram", href: instagramHref },
                { icon: MessageCircle, label: "WhatsApp", href: whatsappHref },
                { icon: Mail, label: "Email", href: emailHref },
              ].map((soc, i) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={i}
                    href={soc.href}
                    target={soc.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      soc.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    aria-label={soc.label}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:scale-110 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div className="pt-4 max-w-md">
              <div className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-3 font-inter">
                {t("النشرة البريدية", "Newsletter")}
              </div>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t(
                      "بريدك لتصلك آخر الأعمال",
                      "Your email for latest work"
                    )}
                    className="flex-1 px-4 py-2.5 bg-background/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={newsletterState === "loading" || newsletterState === "success"}
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {newsletterState === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : newsletterState === "success" ? (
                      <Check className="w-4 h-4" />
                    ) : null}
                    {t("اشترك", "Subscribe")}
                  </button>
                </div>
                {newsletterState === "success" && (
                  <p className="text-xs text-green-400 flex items-center gap-1.5 px-2">
                    <Check className="w-3.5 h-3.5" />
                    {newsletterMsg || t("تم الاشتراك بنجاح!", "Subscribed successfully!")}
                  </p>
                )}
                {newsletterState === "error" && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 px-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {newsletterMsg}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerColumns.map((col, i) => (
              <div key={i}>
                <div className="font-inter text-[10px] tracking-[0.4em] text-primary/70 uppercase mb-5">
                  {t(col.titleAr, col.titleEn)}
                </div>
                <div className="font-amiri text-base text-foreground mb-4">
                  {t(col.titleAr, col.titleEn)}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t(l.labelAr, l.labelEn)}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t(l.labelAr, l.labelEn)}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Big brand mark */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative text-center py-10 mb-8 border-y border-border/40"
        >
          <div className="font-amiri text-6xl md:text-9xl lg:text-[12rem] font-bold leading-none">
            <span className="text-gold-gradient opacity-30">
              {t(siteNameAr, siteNameEn)}
            </span>
          </div>
          <div className="font-display text-xs md:text-sm tracking-[0.5em] text-muted-foreground uppercase mt-3">
            — M · A · R · Y · A · M —
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{footerCopyright}</span>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:text-primary transition-colors">
              {t("سياسة الخصوصية", "Privacy Policy")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("الشروط", "Terms")}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-inter tracking-widest uppercase">
              Crafted in Sana&apos;a
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="إلى الأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Developer signature */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-10 pt-6 border-t border-border/30"
        >
          <a
            href="https://wa.me/967778140990?text=السلام%20عليكم%20وسيم،%20شفت%20موقع%20مريم%20وأعجبني%20عملك"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            dir="rtl"
          >
            <Code2 className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
            <span>صُمّم بكل</span>
            <Heart className="w-3.5 h-3.5 fill-red-500/80 text-red-500/80 group-hover:scale-110 transition-transform" />
            <span>وبرمج بواسطة</span>
            <span className="font-amiri text-sm text-primary font-medium group-hover:underline underline-offset-4 transition-all">
              وسيم الزبيري
            </span>
            <MessageCircle className="w-3 h-3 text-green-500/70 group-hover:text-green-500 transition-colors" />
          </a>
        </motion.div>
      </div>
    </footer>
  );
}

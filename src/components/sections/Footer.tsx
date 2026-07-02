"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  MessageCircle,
  Mail,
  ArrowUp,
  ArrowRight,
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
      { labelAr: "تصوير الأعراس", labelEn: "Weddings", href: "/#services" },
      { labelAr: "بورتريه", labelEn: "Portraits", href: "/#services" },
      { labelAr: "تصوير تجاري", labelEn: "Commercial", href: "/#services" },
      { labelAr: "ورش العمل", labelEn: "Workshops", href: "/#services" },
    ],
  },
  {
    titleAr: "الاستكشاف",
    titleEn: "Explore",
    links: [
      { labelAr: "الرئيسية", labelEn: "Home", href: "/#home" },
      { labelAr: "عن مريم", labelEn: "About", href: "/#about" },
      { labelAr: "الأعمال", labelEn: "Portfolio", href: "/#portfolio" },
      { labelAr: "المدونة", labelEn: "Blog", href: "/blog" },
      { labelAr: "المعرض الكامل", labelEn: "Gallery", href: "/gallery" },
      { labelAr: "احجز جلسة", labelEn: "Booking", href: "/booking" },
    ],
  },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);
  const { t } = useLang();

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
        labelAr: s?.contactAddress || "صنعاء القديمة · اليمن",
        labelEn: s?.contactAddress || "Old Sana'a · Yemen",
        href: "#",
      },
      { labelAr: "احجز جلسة", labelEn: "Book a Session", href: "/booking" },
    ],
  };

  const footerColumns: FooterColumn[] = [...staticColumns, contactColumn];

  const socials = [
    { icon: Instagram, label: "Instagram", href: instagramHref },
    { icon: MessageCircle, label: "WhatsApp", href: whatsappHref },
    { icon: Mail, label: "Email", href: emailHref },
  ];

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
        setNewsletterMsg(t("تم الاشتراك بنجاح!", "Subscribed successfully!"));
        setEmail("");
        setTimeout(() => {
          setNewsletterState("idle");
          setNewsletterMsg("");
        }, 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        setNewsletterState("error");
        setNewsletterMsg(
          data?.error || t("تعذّر الاشتراك. حاول مرة أخرى لاحقًا.", "Could not subscribe. Try again later.")
        );
      }
    } catch {
      setNewsletterState("error");
      setNewsletterMsg(
        t("تعذّر الاتصال بالخادم. حاول مرة أخرى لاحقًا.", "Network error. Try again later.")
      );
    }
  };

  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Decorative background wordmark — very subtle texture, not a feature */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute inset-x-0 bottom-0 text-center font-amiri font-bold leading-none text-foreground/[0.04]"
        style={{ fontSize: "clamp(4rem, 15vw, 12rem)", transform: "translateY(20%)" }}
      >
        {t(siteNameAr, siteNameEn)}
      </span>

      <div className="relative container mx-auto max-w-7xl px-6">
        {/* === TOP: 4-column grid === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12 pt-20 pb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="الصفحة الرئيسية"
            >
              <svg viewBox="0 0 36 36" className="w-9 h-9 text-foreground" aria-hidden>
                <circle
                  cx="18"
                  cy="18"
                  r="16.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="transition-opacity duration-500 group-hover:opacity-60"
                />
                <text
                  x="18"
                  y="24"
                  textAnchor="middle"
                  className="font-display fill-current"
                  fontSize="16"
                  fontWeight="600"
                >
                  M
                </text>
              </svg>
              <span className="flex flex-col leading-none gap-1">
                <span className="font-amiri text-base text-foreground">{siteNameAr}</span>
                <span className="font-inter text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
                  {siteNameEn}
                </span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {footerDesc}
            </p>

            {/* Social — minimal icons, no bubble circles */}
            <div className="flex items-center gap-1 pt-1">
              {socials.map((soc, i) => {
                const Icon = soc.icon;
                const external = soc.href.startsWith("http");
                return (
                  <a
                    key={i}
                    href={soc.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={soc.label}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-300 motion-ease rounded-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 3 link columns */}
          {footerColumns.map((col, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="font-inter text-[10px] tracking-[0.35em] text-primary uppercase">
                {t(col.titleAr, col.titleEn)}
              </div>
              <ul className="flex flex-col gap-3">
                {col.links.map((l, j) => (
                  <li key={j}>
                    {l.href.startsWith("/") ? (
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 motion-ease"
                      >
                        {t(l.labelAr, l.labelEn)}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 motion-ease"
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

        {/* === Newsletter — minimal inline, no card === */}
        <div className="border-t border-border pt-8 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
            <div className="flex flex-col gap-2">
              <span className="font-inter text-[10px] tracking-[0.35em] text-primary uppercase">
                {t("النشرة البريدية", "Newsletter")}
              </span>
              <span className="text-sm text-muted-foreground max-w-sm">
                {t(
                  "اشترك لتصلك آخر الأعمال والإطلاعات.",
                  "Subscribe for latest work and updates."
                )}
              </span>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex-1 max-w-md w-full"
            >
              <div className="flex items-center gap-3 border-b border-border focus-within:border-border-strong transition-colors duration-300 motion-ease py-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(
                    "بريدك الإلكتروني",
                    "Your email"
                  )}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={
                    newsletterState === "loading" ||
                    newsletterState === "success"
                  }
                  aria-label={t("اشترك", "Subscribe")}
                  className="w-9 h-9 flex items-center justify-center text-foreground hover:text-primary transition-colors duration-300 motion-ease disabled:opacity-50"
                >
                  {newsletterState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : newsletterState === "success" ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  )}
                </button>
              </div>
              {newsletterState === "success" && (
                <p className="mt-2 text-xs text-primary flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {newsletterMsg}
                </p>
              )}
              {newsletterState === "error" && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {newsletterMsg}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* === BOTTOM BAR — hairline above, copyright right, crafted + back-to-top left === */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* In RTL: first child → visual right (start) */}
          <span className="text-xs text-muted-foreground">
            {footerCopyright}
          </span>
          <div className="flex items-center gap-4">
            <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Crafted in Sana&apos;a
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-border-strong transition-colors duration-300 motion-ease rounded-sm"
              aria-label={t("إلى الأعلى", "Back to top")}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* === DEVELOPER SIGNATURE — keep, small, centered, with heart === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="py-6 border-t border-border/60"
        >
          <a
            href="https://wa.me/967778140990?text=السلام%20عليكم%20وسيم،%20شفت%20موقع%20مريم%20وأعجبني%20عملك"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-300 motion-ease"
            dir="rtl"
          >
            <Code2 className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
            <span>صُمّم بكل</span>
            <Heart className="w-3.5 h-3.5 fill-destructive/70 text-destructive/70 group-hover:scale-110 transition-transform" />
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

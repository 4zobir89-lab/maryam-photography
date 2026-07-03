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
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  siteNameAr: string;
  footerDesc: string;
  footerCopyright: string;
  contactInstagram: string;
  contactWhatsapp: string;
  contactEmail: string;
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type LinkCol = {
  titleAr: string;
  titleEn: string;
  links: { labelAr: string; labelEn: string; href: string }[];
};

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {});
  }, []);

  const siteNameAr = s?.siteNameAr ?? "مريم";
  const description =
    s?.footerDesc ??
    "بصريات سينمائية من قلب صنعاء. أصوّر الحكايات قبل الأشخاص.";
  const copyright =
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

  const columns: LinkCol[] = [
    {
      titleAr: "استكشف",
      titleEn: "Explore",
      links: [
        { labelAr: "الرئيسية", labelEn: "Home", href: "/#home" },
        { labelAr: "معرض الأعمال", labelEn: "Portfolio", href: "/#portfolio" },
        { labelAr: "عن مريم", labelEn: "About", href: "/#about" },
        { labelAr: "المدونة", labelEn: "Blog", href: "/blog" },
      ],
    },
    {
      titleAr: "الخدمات",
      titleEn: "Services",
      links: [
        { labelAr: "تصوير الأعراس", labelEn: "Weddings", href: "/#services" },
        { labelAr: "بورتريه", labelEn: "Portraits", href: "/#services" },
        { labelAr: "تصوير ثقافي", labelEn: "Culture", href: "/#services" },
        { labelAr: "احجزي الآن", labelEn: "Book Now", href: "/#contact" },
      ],
    },
    {
      titleAr: "تواصل",
      titleEn: "Connect",
      links: [
        { labelAr: "راسلينا", labelEn: "Contact", href: "/#contact" },
        { labelAr: "إنستغرام", labelEn: "Instagram", href: instagramHref },
        { labelAr: "واتساب", labelEn: "WhatsApp", href: whatsappHref },
        { labelAr: "البريد", labelEn: "Email", href: emailHref },
      ],
    },
  ];

  const socials: { icon: LucideIcon; href: string; label: string }[] = [
    { icon: Instagram, href: instagramHref, label: "Instagram" },
    { icon: MessageCircle, href: whatsappHref, label: "WhatsApp" },
    { icon: Mail, href: emailHref, label: "Email" },
  ];

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      {/* Top gold rule */}
      <div className="gold-rule" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.05] blur-[150px] pointer-events-none" />

      {/* Decorative wordmark */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-amiri text-foreground/[0.04] leading-none translate-y-[28%]"
          style={{ fontSize: "clamp(8rem, 22vw, 20rem)" }}
        >
          {siteNameAr}
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main grid — 5 (brand) + 7 (3 link columns) */}
        <div className="grid lg:grid-cols-12 gap-12 mb-14">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-5 space-y-5"
          >
            {/* Rotating logo mark + name */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative w-12 h-12 shrink-0"
              >
                <div className="absolute inset-0 rounded-full border border-primary/30" />
                <div className="absolute inset-1 rounded-full border border-dashed border-primary/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-amiri text-lg text-primary">
                    {siteNameAr.charAt(0)}
                  </span>
                </div>
              </motion.div>
              <div>
                <div className="font-amiri text-2xl text-foreground leading-none">
                  {siteNameAr}
                </div>
                <div className="font-inter text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
                  Visual Storyteller
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="body-base max-w-sm">{description}</p>

            {/* Social icons in glass circles */}
            <div className="flex items-center gap-3 pt-2">
              {socials.map((soc, i) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={i}
                    href={soc.href}
                    target={
                      soc.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      soc.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="glass-card w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-500 motion-ease"
                    aria-label={soc.label}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-8">
            {columns.map((col, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + ci * 0.1,
                  ease: EASE,
                }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px bg-primary/40" />
                  <h4 className="eyebrow">{t(col.titleAr, col.titleEn)}</h4>
                </div>
                <ul className="space-y-2.5">
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 motion-ease inline-flex items-center group"
                      >
                        <span className="text-primary/40 group-hover:text-primary mr-2 text-[10px] transition-colors">
                          ✦
                        </span>
                        {t(link.labelAr, link.labelEn)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hairline */}
        <div className="hairline mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-right">
            <span className="text-xs text-muted-foreground">{copyright}</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-primary/40" />
            <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              {t("صُنع في صنعاء", "Crafted in Sana'a")}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Developer signature */}
            <a
              href="https://wa.me/967778140990"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              dir="rtl"
            >
              <span>{t("تطوير", "Developed by")}</span>
              <Heart
                className="w-3 h-3 fill-accent/70 text-accent/70 group-hover:fill-accent group-hover:text-accent transition-colors"
                strokeWidth={0}
              />
              <span className="font-amiri text-sm text-foreground group-hover:text-primary transition-colors">
                وسيم الزبيري
              </span>
            </a>

            {/* Back to top */}
            <button
              onClick={scrollTop}
              className="group flex items-center gap-2 font-inter text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("إلى الأعلى", "Back to top")}
            >
              <span>{t("الأعلى", "Top")}</span>
              <span className="w-8 h-8 flex items-center justify-center rounded-full border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 motion-ease">
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

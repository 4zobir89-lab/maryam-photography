"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, Mail, ArrowUp } from "lucide-react";

type Settings = {
  siteNameAr: string;
  footerDesc: string;
  footerCopyright: string;
  contactInstagram: string;
  contactWhatsapp: string;
  contactEmail: string;
};

const footerLinks = [
  {
    titleAr: "الخدمات",
    titleEn: "Services",
    links: [
      { labelAr: "تصوير الأعراس", href: "#services" },
      { labelAr: "بورتريه", href: "#services" },
      { labelAr: "تصوير تجاري", href: "#services" },
      { labelAr: "ورش العمل", href: "#services" },
    ],
  },
  {
    titleAr: "الاستكشاف",
    titleEn: "Explore",
    links: [
      { labelAr: "الرئيسية", href: "#home" },
      { labelAr: "عن مريم", href: "#about" },
      { labelAr: "الأعمال", href: "#portfolio" },
      { labelAr: "آراء العملاء", href: "#testimonials" },
    ],
  },
  {
    titleAr: "تواصل",
    titleEn: "Connect",
    links: [
      { labelAr: "hello@maryam.photo", href: "mailto:hello@maryam.photo" },
      { labelAr: "+967 77 123 4567", href: "tel:+967771234567" },
      { labelAr: "صنعاء القديمة", href: "#" },
      { labelAr: "احجز جلسة", href: "#contact" },
    ],
  },
];

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {});
  }, []);

  const siteNameAr = s?.siteNameAr ?? "مريم";
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
                  {siteNameAr}
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
                    rel={soc.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
                Newsletter
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك لتصلك آخر الأعمال"
                  className="flex-1 px-4 py-2.5 bg-background/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                />
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                  اشترك
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((col, i) => (
              <div key={i}>
                <div className="font-inter text-[10px] tracking-[0.4em] text-primary/70 uppercase mb-5">
                  {col.titleEn}
                </div>
                <div className="font-amiri text-base text-foreground mb-4">
                  {col.titleAr}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {l.labelAr}
                      </a>
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
            <span className="text-gold-gradient opacity-30">{siteNameAr}</span>
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
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              الشروط
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-inter tracking-widest uppercase">
              Crafted in Sana'a
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
      </div>
    </footer>
  );
}

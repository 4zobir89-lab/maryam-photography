"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Camera,
  Building2,
  Sparkles,
  Check,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Service = {
  id: number;
  titleAr: string;
  titleEn: string;
  description: string;
  price: string;
  duration: string;
  features: string;
  icon: string;
  featured: boolean;
  published?: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Camera,
  Building2,
  Sparkles,
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function GoldStar({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2 L14.5 9 L22 9.5 L16 14 L18 22 L12 17.5 L6 22 L8 14 L2 9.5 L9.5 9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section
        id="services"
        className="py-24 md:py-36 bg-background border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="services"
      className="relative py-24 md:py-36 bg-background border-t border-border overflow-hidden"
    >
      {/* Ambient decorations */}
      <div className="absolute top-1/4 right-0 w-[440px] h-[440px] rounded-full bg-primary/[0.05] blur-[150px] pointer-events-none animate-slow-pulse" />
      <div
        className="absolute bottom-1/4 left-0 w-[380px] h-[380px] rounded-full bg-accent/[0.05] blur-[150px] pointer-events-none animate-slow-pulse"
        style={{ animationDelay: "2.5s" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-6"
        >
          <span className="w-12 h-px bg-primary/40" />
          <span className="eyebrow">
            {t("Services & Packages", "Services & Packages")}
          </span>
        </motion.div>

        {/* Title + body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="mb-14 max-w-2xl"
        >
          <h2 className="section-title mb-5">
            <span className="text-foreground">خدمات</span>{" "}
            <span className="text-gold-gradient">التصوير</span>
          </h2>
          <p className="body-lg">
            {t(
              "باقات مصممة بعناية لتلتقط كل تفصيلة من حكايتك — من الأعراس إلى البورتريه والثقافة، بأسلوب سينمائي راقٍ.",
              "Thoughtfully crafted packages to capture every detail of your story — from weddings to portraits and culture, in a cinematic style."
            )}
          </p>
        </motion.div>

        {/* Cards grid */}
        {services.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد خدمات بعد.", "No services yet.")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Camera;
              let featuresList: string[] = [];
              try {
                const parsed = JSON.parse(service.features || "[]");
                if (Array.isArray(parsed)) {
                  featuresList = parsed.filter(
                    (x): x is string => typeof x === "string"
                  );
                }
              } catch {
                featuresList = [];
              }
              const featured = !!service.featured;

              return (
                <motion.div
                  key={service.id ?? i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                  className={`relative p-7 rounded-2xl lift-card flex flex-col overflow-hidden ${
                    featured
                      ? "glass-dark border border-primary/30 ambient-glow"
                      : "surface-card"
                  }`}
                >
                  {/* Featured ribbon */}
                  {featured && (
                    <div className="absolute top-5 left-5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-inter text-[10px] tracking-[0.2em] uppercase font-medium">
                      {t("المميزة", "Featured")}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="relative w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 mt-2">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* Texts */}
                  <div className="mb-3">
                    <p className="eyebrow mb-2">{service.titleEn}</p>
                    <h3
                      className={`font-amiri text-xl leading-tight ${
                        featured ? "text-white" : "text-foreground"
                      }`}
                    >
                      {service.titleAr}
                    </h3>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p
                      className={`text-xs leading-relaxed mb-4 ${
                        featured ? "text-white/65" : "text-muted-foreground"
                      }`}
                    >
                      {service.description}
                    </p>
                  )}

                  {/* Price + duration */}
                  <div className="flex items-end justify-between gap-3 mb-2">
                    {service.price && (
                      <span
                        className="font-display text-xl text-gradient"
                        dir="ltr"
                      >
                        {service.price}
                      </span>
                    )}
                    {service.duration && (
                      <span
                        className={`font-inter text-[10px] tracking-[0.2em] uppercase ${
                          featured ? "text-white/55" : "text-muted-foreground"
                        }`}
                      >
                        {service.duration}
                      </span>
                    )}
                  </div>

                  {/* Gold rule divider */}
                  <div className="gold-rule my-4" />

                  {/* Features list */}
                  {featuresList.length > 0 && (
                    <ul
                      className={`space-y-2.5 mb-6 ${
                        featured ? "text-white/80" : "text-foreground/80"
                      }`}
                    >
                      {featuresList.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs leading-relaxed"
                        >
                          <Check
                            className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0"
                            strokeWidth={2}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <button
                    onClick={scrollToContact}
                    className="btn-luxury mt-auto w-full py-3 px-5 rounded-full bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {t("احجزي الآن", "Book Now")}
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom note with gold star */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="flex items-center justify-center gap-2.5 mt-14 text-sm text-muted-foreground"
        >
          <GoldStar className="text-primary" />
          <span>
            {t(
              "جميع الباقات قابلة للتخصيص حسب احتياجاتك.",
              "All packages are customizable to your needs."
            )}
          </span>
          <GoldStar className="text-primary" />
        </motion.div>
      </div>
    </section>
  );
}

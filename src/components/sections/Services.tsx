"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Camera,
  Building2,
  Sparkles,
  Check,
  LucideIcon,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Service = {
  id: number;
  titleAr: string;
  titleEn: string;
  description: string;
  price: string;
  duration: string;
  features: string; // JSON string array
  icon: string;
  accentFrom: string;
  featured: boolean;
  published: boolean;
  order: number;
};

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Camera,
  Building2,
  Sparkles,
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

function LoadingSkeleton() {
  return (
    <section
      id="services"
      className="relative py-28 md:py-40 bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </section>
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

  if (loading) return <LoadingSkeleton />;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      id="services"
      dir="rtl"
      className="relative py-28 md:py-40 bg-background overflow-hidden"
    >
      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* === Editorial split header (left-aligned) === */}
        <motion.div
          {...fade(0)}
          className="flex flex-col gap-4 mb-16 md:mb-24 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/70" aria-hidden />
            <span className="eyebrow">
              {t("الخدمات والباقات", "Services & Packages")}
            </span>
          </div>
          <h2 className="section-title text-foreground">
            {t("خدمات التصوير", "Photography Services")}
          </h2>
          <p className="body-lg max-w-2xl pt-2">
            {t(
              "باقات مصممة بعناية لتناسب كل مناسبة. كل خدمة تأتي بلمسة سينمائية خاصة، واهتمام بأدق التفاصيل من اللقطة الأولى حتى التسليم النهائي.",
              "Carefully crafted packages for every occasion. Each service carries its own cinematic signature, with attention to the finest detail — from first frame to final delivery."
            )}
          </p>
          <div className="hairline w-24 mt-2" />
        </motion.div>

        {/* Services grid */}
        {services.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {t("لا توجد خدمات منشورة بعد.", "No services published yet.")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Camera;
              let featuresList: string[] = [];
              try {
                const parsed = JSON.parse(service.features || "[]");
                if (Array.isArray(parsed))
                  featuresList = parsed.filter(
                    (x) => typeof x === "string"
                  ) as string[];
              } catch {
                featuresList = [];
              }

              const featured = !!service.featured;

              return (
                <motion.div
                  key={service.id ?? i}
                  {...fade(i * 0.08)}
                  className={`surface-card relative group p-6 flex flex-col transition-all duration-500 motion-ease hover:-translate-y-1 hover:border-border-strong ${
                    featured ? "border-border-strong/50" : ""
                  }`}
                >
                  {/* Featured badge — small pill, top-right, gold bg */}
                  {featured && (
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-medium tracking-wider rounded-full">
                      {t("الأكثر طلبًا", "Most Booked")}
                    </div>
                  )}

                  {/* Icon — small square (w-10 h-10), border hairline, NOT circle */}
                  <div className="w-10 h-10 border border-border flex items-center justify-center mb-5">
                    <Icon
                      className="w-5 h-5 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="eyebrow mb-1.5">{service.titleEn}</div>
                  <h3 className="font-amiri text-xl text-foreground mb-4 leading-snug">
                    {service.titleAr}
                  </h3>

                  {/* Price — font-display, gold (NOT gradient) */}
                  {service.price && (
                    <div className="font-display text-lg text-primary font-semibold leading-none">
                      {service.price}
                    </div>
                  )}
                  {service.duration && (
                    <div className="text-xs text-muted-foreground mt-2 tracking-wide">
                      {service.duration}
                    </div>
                  )}

                  {/* Thin hairline divider */}
                  <div className="hairline my-5" />

                  {/* Features list — minimal, small gold check (1.5 stroke) */}
                  {featuresList.length > 0 && (
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {featuresList.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check
                            className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5"
                            strokeWidth={1.5}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Button — full width, solid primary if featured, outline if not. NO rounded-full. */}
                  <button
                    onClick={() => scrollTo("contact")}
                    className={`w-full py-3 text-sm font-medium tracking-wide transition-colors duration-300 motion-ease rounded-md ${
                      featured
                        ? "bg-primary text-primary-foreground hover:bg-primary-pale"
                        : "border border-border text-foreground hover:border-border-strong hover:text-primary"
                    }`}
                  >
                    {t("احجز الآن", "Book Now")}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom note — small italic customization note */}
        <motion.div
          {...fade(0.2)}
          className="mt-16 flex justify-start"
        >
          <p className="text-sm italic text-muted-foreground leading-loose max-w-2xl">
            {t(
              "✦ جميع الباقات قابلة للتخصيص حسب احتياجاتك. للمناسبات الكبرى والمشاريع الإبداعية، تواصل مباشرة للحصول على عرض مخصص.",
              "✦ All packages are fully customizable. For large-scale events and creative projects, reach out directly for a tailored proposal."
            )}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

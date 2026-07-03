"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Camera, Building2, Sparkles, Check, LucideIcon } from "lucide-react";
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
};

const iconMap: Record<string, LucideIcon> = { Heart, Camera, Building2, Sparkles };
const EASE = [0.22, 0.61, 0.36, 1] as const;

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
      <section id="services" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="relative py-32 md:py-48 bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary/60" />
            <span className="eyebrow">{t("Services & Packages", "Services & Packages")}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-gold-gradient">خدمات</span>{" "}
            <span className="text-foreground">التصوير</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t(
              "باقات مصممة بعناية لتناسب كل مناسبة. كل خدمة تأتي بلمسة سينمائية خاصة.",
              "Thoughtfully crafted packages for every occasion. Each service carries a cinematic signature."
            )}
          </p>
        </motion.div>

        {/* Grid — luxury cards */}
        {services.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد خدمات منشورة بعد.", "No published services yet.")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Camera;
              let featuresList: string[] = [];
              try {
                const parsed = JSON.parse(service.features || "[]");
                if (Array.isArray(parsed)) featuresList = parsed.filter((x) => typeof x === "string") as string[];
              } catch {}

              return (
                <motion.div
                  key={service.id ?? i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                  className={`relative p-7 rounded-2xl lift-card overflow-hidden ${
                    service.featured
                      ? "glass-strong border border-primary/30 shadow-gold"
                      : "glass border border-[var(--glass-border)]"
                  }`}
                >
                  {/* Accent gradient */}
                  <div
                    className="absolute inset-0 opacity-50 pointer-events-none"
                    style={{
                      background: `linear-gradient(to bottom, oklch(82% 0.13 80 / 0.08), transparent)`,
                    }}
                  />

                  {service.featured && (
                    <div className="absolute top-5 left-5 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-medium tracking-[0.15em] uppercase rounded-full">
                      {t("الأكثر طلبًا", "Popular")}
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>

                    <div className="eyebrow mb-2">{service.titleEn}</div>
                    <h3 className="font-amiri text-2xl text-foreground mb-3">{service.titleAr}</h3>

                    {service.price && (
                      <div className="font-display text-2xl text-gold-gradient font-medium mb-1" dir="ltr">
                        {service.price}
                      </div>
                    )}
                    {service.duration && (
                      <div className="text-xs text-muted-foreground mb-5">{service.duration}</div>
                    )}

                    <div className="gold-hairline w-12 mb-5" />

                    {/* Features */}
                    {featuresList.length > 0 && (
                      <ul className="space-y-2.5 mb-6">
                        {featuresList.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => {
                        const el = document.getElementById("contact");
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }}
                      className={`w-full py-3 rounded-full text-sm font-medium transition-all duration-300 motion-ease ${
                        service.featured
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border border-border text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {t("احجزي الآن", "Book Now")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="text-center mt-14"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="text-primary">✦</span>{" "}
            {t(
              "جميع الباقات قابلة للتخصيص. للمناسبات الكبرى، تواصلي مباشرة لعرض مخصص.",
              "All packages are customizable. For large events, contact directly for a custom quote."
            )}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

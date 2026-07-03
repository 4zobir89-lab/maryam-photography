"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Camera, Building2, Sparkles, Check, ArrowLeft, LucideIcon } from "lucide-react";
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
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-32 md:py-48 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section number */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="font-inter text-xs tracking-[0.3em] text-muted-foreground">03</span>
          <span className="w-12 h-px bg-border" />
          <span className="eyebrow">{t("Services", "Services")}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12"
        >
          <h2 className="section-title">
            <span className="text-gold-gradient">خدمات</span>{" "}
            <span className="text-foreground">التصوير</span>
          </h2>
        </motion.div>

        {/* Horizontal rows — DIFFERENT from Portfolio masonry */}
        {services.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد خدمات بعد.", "No services yet.")}
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border">
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
                  className="group py-8 md:py-10 grid md:grid-cols-12 gap-6 md:gap-10 items-center hover:bg-card/40 transition-colors duration-500 motion-ease px-2 md:px-4"
                >
                  {/* Left: number + icon + title */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <span className="font-inter text-xs tracking-[0.2em] text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-10 h-10 flex items-center justify-center border border-border text-primary group-hover:border-primary/40 transition-colors">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-amiri text-xl text-foreground">{service.titleAr}</h3>
                      <p className="font-display text-xs text-muted-foreground tracking-wider mt-0.5">{service.titleEn}</p>
                    </div>
                  </div>

                  {/* Middle: features inline */}
                  <div className="md:col-span-5">
                    {featuresList.length > 0 && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {featuresList.slice(0, 4).join(" · ")}
                        {featuresList.length > 4 && ` · +${featuresList.length - 4}`}
                      </p>
                    )}
                    {service.duration && (
                      <p className="text-xs text-muted-foreground/60 mt-1">{service.duration}</p>
                    )}
                  </div>

                  {/* Right: price + arrow */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
                    {service.price && (
                      <span className="font-display text-lg text-primary" dir="ltr">{service.price}</span>
                    )}
                    <button
                      onClick={() => {
                        const el = document.getElementById("contact");
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 64;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center border border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 motion-ease"
                      aria-label={t("احجزي", "Book")}
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <span className="text-primary mr-2">✦</span>
          {t("جميع الباقات قابلة للتخصيص حسب احتياجاتك.", "All packages are customizable to your needs.")}
        </motion.p>
      </div>
    </section>
  );
}

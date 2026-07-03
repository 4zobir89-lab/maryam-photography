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
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-32 md:py-48 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12"
        >
          <span className="eyebrow mb-3 block">Services</span>
          <h2 className="section-title">
            <span className="text-gold-gradient">خدمات</span>{" "}
            <span className="text-foreground">التصوير</span>
          </h2>
        </motion.div>

        {services.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد خدمات بعد.", "No services yet.")}
          </div>
        ) : (
          <div className="space-y-4">
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
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                  className={`p-6 md:p-8 lift-card bg-card border ${
                    service.featured ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    {/* Left: icon + title */}
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 flex items-center justify-center border border-border text-primary">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        {service.featured && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-medium tracking-[0.15em] uppercase">
                            {t("مميز", "Popular")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-amiri text-xl text-foreground mb-1">{service.titleAr}</h3>
                      <p className="font-display text-xs text-muted-foreground tracking-wider">{service.titleEn}</p>
                      {service.duration && (
                        <p className="text-xs text-muted-foreground mt-2">{service.duration}</p>
                      )}
                    </div>

                    {/* Middle: features */}
                    <div className="md:col-span-5">
                      {featuresList.length > 0 && (
                        <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-4">
                          {featuresList.map((f, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Right: price + CTA */}
                    <div className="md:col-span-3 md:text-left">
                      {service.price && (
                        <div className="font-display text-xl text-primary font-medium mb-3" dir="ltr">
                          {service.price}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const el = document.getElementById("contact");
                          if (el) {
                            const top = el.getBoundingClientRect().top + window.scrollY - 64;
                            window.scrollTo({ top, behavior: "smooth" });
                          }
                        }}
                        className={`w-full md:w-auto px-5 py-2.5 text-sm font-medium transition-all duration-300 motion-ease ${
                          service.featured
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border text-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {t("احجزي", "Book")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

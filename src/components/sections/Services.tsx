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

function LoadingSkeleton() {
  return (
    <section
      id="services"
      className="relative py-32 md:py-44 bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </section>
  );
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <section
      id="services"
      className="relative py-32 md:py-44 bg-background overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full bg-[oklch(0.78_0.13_75_/_0.03)] blur-[150px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — Services & Packages —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gold-gradient">خدمات</span>{" "}
            <span className="text-foreground">التصوير</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-loose">
            باقات مصممة بعناية لتناسب كل مناسبة. كل خدمة تأتي بلمسة سينمائية
            خاصة، واهتمام بأدق التفاصيل من اللقطة الأولى حتى التسليم النهائي.
          </p>
        </motion.div>

        {/* Services grid */}
        {services.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            لا توجد خدمات منشورة بعد.
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            return (
              <motion.div
                key={service.id ?? i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`lift-card relative group p-8 rounded-sm overflow-hidden border ${
                  service.featured
                    ? "border-primary/60 bg-gradient-to-b from-primary/5 to-card"
                    : "border-border/60 bg-card/40 backdrop-blur-sm"
                }`}
              >
                {/* Accent gradient */}
                <div
                  className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, ${service.accentFrom}, transparent)`,
                  }}
                />

                {service.featured && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-medium tracking-widest uppercase rounded-full">
                    الأكثر طلبًا
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mb-2">
                    {service.titleEn}
                  </div>
                  <h3 className="font-amiri text-3xl text-foreground mb-3">
                    {service.titleAr}
                  </h3>

                  {service.price && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display text-2xl text-gold-gradient font-bold">
                        {service.price}
                      </span>
                    </div>
                  )}
                  {service.duration && (
                    <div className="text-xs text-muted-foreground mb-6">
                      المدة: {service.duration}
                    </div>
                  )}

                  <div className="hairline w-12 mb-5" />

                  {/* Features */}
                  {featuresList.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {featuresList.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    className={`w-full py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                      service.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border text-foreground hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => {
                      const el = document.getElementById("contact");
                      if (el)
                        window.scrollTo({
                          top: el.getBoundingClientRect().top + window.scrollY - 60,
                          behavior: "smooth",
                        });
                    }}
                  >
                    احجز الآن
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
          transition={{ duration: 1 }}
          className="text-center mt-16"
        >
          <p className="text-sm text-muted-foreground leading-loose max-w-2xl mx-auto">
            <span className="text-primary">✦</span> جميع الباقات قابلة للتخصيص حسب
            احتياجاتك. للمناسبات الكبرى والمشاريع الإبداعية، تواصل مباشرة للحصول
            على عرض مخصص.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

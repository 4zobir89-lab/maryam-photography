"use client";

import { motion } from "framer-motion";
import { Heart, Camera, Building2, Sparkles, Check } from "lucide-react";

const services = [
  {
    icon: Heart,
    titleAr: "تصوير الأعراس",
    titleEn: "Wedding Photography",
    price: "يبدأ من 1,200$",
    duration: "8 ساعات",
    featured: true,
    features: [
      "تغطية كاملة لليوم (تصوير + فيديو)",
      "جلسة قبل العرس (Pre-wedding)",
      "300 صورة معدلة بدقة عالية",
      "ألبوم فاخر مطبوع 30×40",
      "معرض إلكتروني خاص للضيوف",
      "تسليم خلال 4 أسابيع",
    ],
    accent: "from-[oklch(0.78_0.13_75_/_0.15)] to-transparent",
  },
  {
    icon: Camera,
    titleAr: "بورتريه فردي",
    titleEn: "Portrait Sessions",
    price: "يبدأ من 350$",
    duration: "2 ساعة",
    featured: false,
    features: [
      "جلسة في الاستوديو أو خارجي",
      "استشارة قبل الجلسة",
      "50 صورة معدلة",
      "حقوق استخدام كاملة",
      "3 صور مطبوعة فاخرة A4",
      "تسليم خلال أسبوعين",
    ],
    accent: "from-[oklch(0.55_0.1_40_/_0.12)] to-transparent",
  },
  {
    icon: Building2,
    titleAr: "تصوير تجاري",
    titleEn: "Commercial",
    price: "يبدأ من 800$",
    duration: "حسب المشروع",
    featured: false,
    features: [
      "تصوير منتجات / علامات تجارية",
      "تصوير معماري وعقاري",
      "استخدام للإعلانات ووسائل التواصل",
      "50 صورة معدلة + RAW",
      "حقوق استخدام تجاري كامل",
      "تسليم خلال 2-3 أسابيع",
    ],
    accent: "from-[oklch(0.4_0.05_285_/_0.12)] to-transparent",
  },
  {
    icon: Sparkles,
    titleAr: "ورش عمل وتدريب",
    titleEn: "Workshops",
    price: "يبدأ من 200$",
    duration: "3 أيام",
    featured: false,
    features: [
      "ورشة عملية في صنعاء",
      "أساسيات الإضاءة الطبيعية",
      "تحرير متقدم (Lightroom)",
      "شهادة إتمام الدورة",
      "مجموعة إعدادات Lightroom",
      "متابعة لمدة 3 أشهر",
    ],
    accent: "from-[oklch(0.7_0.1_60_/_0.12)] to-transparent",
  },
];

export function Services() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
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
                  className={`absolute inset-0 bg-gradient-to-b ${service.accent} opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`}
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

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display text-2xl text-gold-gradient font-bold">
                      {service.price}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-6">
                    المدة: {service.duration}
                  </div>

                  <div className="hairline w-12 mb-5" />

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {service.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

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

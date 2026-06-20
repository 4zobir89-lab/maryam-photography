"use client";

import { motion } from "framer-motion";
import { Camera, Award, Globe2, Heart } from "lucide-react";

const philosophy = [
  {
    icon: Camera,
    titleAr: "بصمة بصرية",
    titleEn: "Signature",
    descAr:
      "كل صورة تُحمل بصمتي السينمائية: ضوء دافئ، ظلال عميقة، وحكاية تُروى قبل أن يلمحها الناظر.",
  },
  {
    icon: Globe2,
    titleAr: "جذور يمنية",
    titleEn: "Yemeni Roots",
    descAr:
      "أصيل من صنعاء القديمة. أنقل تراث اليمن المعماري والإنساني إلى مشهد بصري عالمي معاصر.",
  },
  {
    icon: Award,
    titleAr: "تكريم دولي",
    titleEn: "Recognition",
    descAr:
      "أعمالي عُرضت في معارض دبي، إسطنبول، وبرلين. حائزة على جوائز Sony World Photography و National Geographic Yemen.",
  },
  {
    icon: Heart,
    titleAr: "روح الإنسان",
    titleEn: "Human Soul",
    descAr:
      "أبحث دائمًا عن اللحظة العفوية التي تنسى فيها الكاميرا — حين يظهر الناس كما هم حقًا.",
  },
];

export function About() {
  return (
    <section
      id="about"
      className="relative py-32 md:py-44 overflow-hidden bg-background"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.78_0.13_75_/_0.04)] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.55_0.1_40_/_0.05)] blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — About the Artist —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gold-gradient">قصة</span>{" "}
            <span className="text-foreground">خلف العدسة</span>
          </h2>
          <div className="hairline w-32 mx-auto" />
        </motion.div>

        {/* Bio layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          {/* Portrait placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto group">
              {/* Frame */}
              <div className="absolute -inset-3 border border-primary/30 rounded-sm" />
              <div className="absolute -inset-1.5 border border-primary/15 rounded-sm" />

              {/* Image */}
              <div className="relative w-full h-full overflow-hidden rounded-sm bg-gradient-to-br from-[oklch(0.18_0.02_50)] via-[oklch(0.12_0.01_285)] to-[oklch(0.06_0.005_285)]">
                {/* Silhouette of photographer */}
                <svg
                  viewBox="0 0 300 400"
                  className="absolute inset-0 w-full h-full opacity-90"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <radialGradient id="bgGrad" cx="50%" cy="35%" r="60%">
                      <stop
                        offset="0%"
                        stopColor="oklch(0.3 0.08 50)"
                        stopOpacity="0.5"
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.05 0 0)"
                        stopOpacity="1"
                      />
                    </radialGradient>
                    <linearGradient id="silGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.15 0.02 50)" />
                      <stop offset="100%" stopColor="oklch(0.04 0 0)" />
                    </linearGradient>
                  </defs>
                  <rect width="300" height="400" fill="url(#bgGrad)" />
                  {/* Silhouette */}
                  <ellipse cx="150" cy="140" rx="55" ry="65" fill="url(#silGrad)" />
                  <path
                    d="M 80 400 Q 80 250 150 230 Q 220 250 220 400 Z"
                    fill="url(#silGrad)"
                  />
                  {/* Camera */}
                  <rect
                    x="120"
                    y="280"
                    width="60"
                    height="40"
                    rx="4"
                    fill="oklch(0.1 0 0)"
                    stroke="oklch(0.78 0.13 75)"
                    strokeWidth="1"
                  />
                  <circle cx="150" cy="300" r="10" fill="none" stroke="oklch(0.78 0.13 75)" strokeWidth="1" />
                  <circle cx="150" cy="300" r="5" fill="oklch(0.78 0.13 75)" opacity="0.5" />
                </svg>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                {/* Caption */}
                <div className="absolute bottom-6 right-6 left-6">
                  <div className="text-[10px] tracking-[0.4em] text-primary/80 uppercase font-inter mb-1">
                    Portrait
                  </div>
                  <div className="font-amiri text-2xl text-foreground">
                    مريم الحضرمي
                  </div>
                  <div className="font-display text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Sana'a · 2024
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-background border border-primary/30 flex flex-col items-center justify-center pulse-glow">
                <span className="font-display text-2xl text-gold-gradient font-bold">
                  7+
                </span>
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
                  Years
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="font-inter text-xs tracking-[0.4em] text-primary uppercase">
              The Story
            </span>

            <h3 className="font-amiri text-4xl md:text-5xl font-bold leading-tight text-foreground">
              من سردات صنعاء إلى{" "}
              <span className="text-gold-gradient">عدسة العالم</span>
            </h3>

            <p className="text-lg md:text-xl text-muted-foreground leading-loose">
              وُلدت مريم في قلب صنعاء القديمة، حيث يتنفس التراب ضوءًا ذهبيًا مع
              كل غروب. حملت أول كاميرا في الخامسة عشرة من عمرها، ومنذ ذلك اليوم
              لم تعد العدسة أداةً بل امتدادًا لروحها. تتأمل في الناس ما لا يقولونه،
              وتلتقط في المدن ما يفوت العابرين.
            </p>

            <p className="text-base md:text-lg text-muted-foreground/80 leading-loose">
              درست الفنون البصرية في دبي، وعملت لاحقًا مع منصات دولية مثل
              National Geographic Arabia و Magnum Photos. لكنها بقيت وفية
              لجذورها — تستلهم من العمارة اليمانية، ومن وجوه الناس في الأسواق
              القديمة، ومن ضوء الصباح الذي يلامس جدران الجبس. كل صورة عندها ليست
              لقطة، بل وثيقة إنسانية تحمل بصمة الزمان والمكان.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              {[
                "بورتريه",
                "تصوير أعراس",
                "تصوير ثقافي",
                "فوتوجورناليزم",
                "تصوير معماري",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 text-sm border border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Signature */}
            <div className="pt-8 flex items-center gap-6">
              <div className="font-amiri text-3xl text-gold-gradient">
                ~ مريم
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
              <div className="text-right">
                <div className="font-display text-sm text-foreground tracking-wider">
                  Maryam Al-Hadhrami
                </div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  Visual Storyteller
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Philosophy grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {philosophy.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="lift-card group relative p-6 bg-card/40 backdrop-blur-sm border border-border/60 rounded-sm overflow-hidden"
              >
                {/* Corner accents */}
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-primary/40" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-primary/40" />

                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mb-2">
                  {item.titleEn}
                </div>
                <h4 className="font-amiri text-2xl text-foreground mb-3">
                  {item.titleAr}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.descAr}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

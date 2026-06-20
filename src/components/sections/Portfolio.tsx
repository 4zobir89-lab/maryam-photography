"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Maximize2, X } from "lucide-react";

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  category: "weddings" | "portraits" | "culture" | "landscapes";
  year: string;
  location: string;
  // visual style: gradient palette + emoji-style SVG motif
  palette: [string, string, string];
  motif: "bride" | "mountain" | "face" | "city" | "desert" | "tower" | "wave" | "tree";
  span?: "wide" | "tall";
};

const projects: Project[] = [
  {
    id: 1,
    titleAr: "عروس صنعاء",
    titleEn: "Bride of Sana'a",
    category: "weddings",
    year: "2024",
    location: "صنعاء القديمة",
    palette: ["oklch(0.4 0.1 40)", "oklch(0.2 0.05 285)", "oklch(0.78 0.13 75)"],
    motif: "bride",
    span: "tall",
  },
  {
    id: 2,
    titleAr: "وجه من حضرموت",
    titleEn: "A Face from Hadramaut",
    category: "portraits",
    year: "2024",
    location: "تريم",
    palette: ["oklch(0.5 0.08 50)", "oklch(0.15 0.02 30)", "oklch(0.85 0.1 80)"],
    motif: "face",
    span: "wide",
  },
  {
    id: 3,
    titleAr: "أبراج اليمن",
    titleEn: "Yemeni Towers",
    category: "culture",
    year: "2023",
    location: "شبام حضرموت",
    palette: ["oklch(0.55 0.12 60)", "oklch(0.25 0.05 40)", "oklch(0.9 0.08 80)"],
    motif: "tower",
  },
  {
    id: 4,
    titleAr: "صحراء الربع الخالي",
    titleEn: "Empty Quarter",
    category: "landscapes",
    year: "2023",
    location: "حدود المهرة",
    palette: ["oklch(0.6 0.1 55)", "oklch(0.3 0.05 35)", "oklch(0.85 0.12 75)"],
    motif: "desert",
    span: "wide",
  },
  {
    id: 5,
    titleAr: "عرس عدني",
    titleEn: "Adeni Wedding",
    category: "weddings",
    year: "2024",
    location: "عدن",
    palette: ["oklch(0.45 0.15 350)", "oklch(0.15 0.03 320)", "oklch(0.85 0.1 75)"],
    motif: "bride",
  },
  {
    id: 6,
    titleAr: "أمواج العرب",
    titleEn: "Tides of Arabia",
    category: "landscapes",
    year: "2023",
    location: "ساحل حضرموت",
    palette: ["oklch(0.4 0.08 220)", "oklch(0.1 0.02 240)", "oklch(0.7 0.1 200)"],
    motif: "wave",
    span: "tall",
  },
  {
    id: 7,
    titleAr: "الحكمة في العيون",
    titleEn: "Wisdom in Eyes",
    category: "portraits",
    year: "2024",
    location: "ذمار",
    palette: ["oklch(0.35 0.08 30)", "oklch(0.1 0.01 30)", "oklch(0.85 0.1 70)"],
    motif: "face",
  },
  {
    id: 8,
    titleAr: "سوق الملح",
    titleEn: "Salt Market",
    category: "culture",
    year: "2023",
    location: "صنعاء",
    palette: ["oklch(0.5 0.1 45)", "oklch(0.18 0.03 30)", "oklch(0.78 0.13 75)"],
    motif: "city",
  },
  {
    id: 9,
    titleAr: "سنديانة بلقيس",
    titleEn: "Bilqis' Oak",
    category: "landscapes",
    year: "2024",
    location: "إب",
    palette: ["oklch(0.4 0.1 140)", "oklch(0.12 0.02 150)", "oklch(0.85 0.1 80)"],
    motif: "tree",
  },
];

const categories = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "weddings", labelAr: "أعراس", labelEn: "Weddings" },
  { id: "portraits", labelAr: "بورتريه", labelEn: "Portraits" },
  { id: "culture", labelAr: "ثقافة", labelEn: "Culture" },
  { id: "landscapes", labelAr: "مناظر", labelEn: "Landscapes" },
];

function MotifSvg({ motif, palette }: { motif: Project["motif"]; palette: string[] }) {
  const [c1, c2, c3] = palette;
  const gradId = `g-${motif}-${c1.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="60%" stopColor={c2} />
          <stop offset="100%" stopColor="oklch(0.05 0 0)" />
        </linearGradient>
        <radialGradient id={`${gradId}-r`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c3} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradId})`} />
      <rect width="400" height="300" fill={`url(#${gradId}-r)`} />

      {/* Motif */}
      {motif === "bride" && (
        <g opacity="0.85">
          <ellipse cx="200" cy="130" rx="55" ry="65" fill={c3} opacity="0.4" />
          <path
            d="M 130 300 Q 130 200 200 180 Q 270 200 270 300 Z"
            fill={c3}
            opacity="0.3"
          />
          <path
            d="M 145 110 Q 200 50 255 110 Q 255 70 200 50 Q 145 70 145 110 Z"
            fill="oklch(0.1 0 0)"
            opacity="0.7"
          />
          <circle cx="200" cy="135" r="40" fill="none" stroke={c3} strokeWidth="0.5" opacity="0.5" />
        </g>
      )}
      {motif === "face" && (
        <g opacity="0.8">
          <ellipse cx="200" cy="150" rx="80" ry="100" fill={c2} opacity="0.6" />
          <ellipse cx="180" cy="140" rx="6" ry="4" fill="oklch(0.05 0 0)" />
          <ellipse cx="220" cy="140" rx="6" ry="4" fill="oklch(0.05 0 0)" />
          <path d="M 180 180 Q 200 195 220 180" stroke="oklch(0.1 0 0)" strokeWidth="2" fill="none" />
          <path d="M 200 70 Q 140 90 130 130" stroke={c3} strokeWidth="3" fill="none" opacity="0.6" />
        </g>
      )}
      {motif === "tower" && (
        <g opacity="0.85">
          {[100, 180, 260].map((x, i) => (
            <g key={i}>
              <rect x={x - 25} y={80 + i * 20} width="50" height={220 - i * 20} fill={c3} opacity="0.3" />
              <rect x={x - 30} y={70 + i * 20} width="60" height="14" fill={c3} opacity="0.5" />
              <polygon points={`${x - 28},${70 + i * 20} ${x + 28},${70 + i * 20} ${x},${50 + i * 20}`} fill={c3} opacity="0.6" />
              {[120, 160, 200, 240].map((y) => (
                <rect key={y} x={x - 4} y={y + i * 20} width="8" height="12" fill="oklch(0.1 0 0)" opacity="0.7" />
              ))}
            </g>
          ))}
        </g>
      )}
      {motif === "desert" && (
        <g opacity="0.85">
          <circle cx="200" cy="100" r="40" fill={c3} opacity="0.5" />
          <path d="M 0 220 Q 100 180 200 210 Q 300 240 400 200 L 400 300 L 0 300 Z" fill={c1} opacity="0.5" />
          <path d="M 0 250 Q 100 220 200 240 Q 300 260 400 230 L 400 300 L 0 300 Z" fill={c2} opacity="0.6" />
        </g>
      )}
      {motif === "wave" && (
        <g opacity="0.85">
          <path d="M 0 180 Q 100 130 200 180 Q 300 230 400 180 L 400 300 L 0 300 Z" fill={c1} opacity="0.5" />
          <path d="M 0 220 Q 100 180 200 220 Q 300 260 400 220 L 400 300 L 0 300 Z" fill={c2} opacity="0.7" />
          <path d="M 0 260 Q 100 230 200 260 Q 300 290 400 260 L 400 300 L 0 300 Z" fill="oklch(0.05 0 0)" opacity="0.8" />
        </g>
      )}
      {motif === "city" && (
        <g opacity="0.85">
          {[60, 130, 200, 270, 340].map((x, i) => (
            <g key={i}>
              <rect x={x} y={150 + (i % 2) * 20} width="55" height={150 - (i % 2) * 20} fill={c3} opacity="0.3" />
              <rect x={x} y={140 + (i % 2) * 20} width="55" height="10" fill={c3} opacity="0.5" />
              {Array.from({ length: 4 }).map((_, r) => (
                <g key={r}>
                  <rect x={x + 10} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                  <rect x={x + 25} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                  <rect x={x + 40} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                </g>
              ))}
            </g>
          ))}
        </g>
      )}
      {motif === "tree" && (
        <g opacity="0.85">
          <rect x="195" y="180" width="10" height="100" fill={c2} />
          <circle cx="200" cy="160" r="80" fill={c1} opacity="0.6" />
          <circle cx="160" cy="140" r="50" fill={c1} opacity="0.5" />
          <circle cx="240" cy="140" r="50" fill={c1} opacity="0.5" />
          <circle cx="200" cy="100" r="50" fill={c1} opacity="0.7" />
          <circle cx="200" cy="160" r="3" fill={c3} />
        </g>
      )}

      {/* Grain overlay */}
      <rect width="400" height="300" fill="oklch(0.05 0 0)" opacity="0.2" />
    </svg>
  );
}

export function Portfolio() {
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <section
      id="portfolio"
      className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
    >
      {/* Decorative top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — Selected Works —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">معرض</span>{" "}
            <span className="text-gold-gradient">الأعمال</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-loose">
            مجموعة مختارة من أعمالي عبر السنوات — كل صورة تحكي حكاية، وكل إطار
            يحفظ لحظة لا تتكرر.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`group px-5 py-2.5 text-sm font-medium tracking-wide border rounded-full transition-all duration-300 ${
                active === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.labelAr}
              <span className="font-inter text-[10px] tracking-widest ml-2 opacity-60">
                {cat.labelEn}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[360px]"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.button
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                onClick={() => setSelected(project)}
                className={`group relative overflow-hidden bg-card border border-border/40 rounded-sm cursor-pointer ${
                  project.span === "wide"
                    ? "md:col-span-2"
                    : project.span === "tall"
                    ? "md:row-span-2"
                    : ""
                }`}
              >
                {/* Image / visual */}
                <div className="absolute inset-0">
                  <MotifSvg motif={project.motif} palette={project.palette} />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Hover action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full border border-primary/60 bg-background/40 backdrop-blur-sm flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-right transform translate-y-0 group-hover:translate-y-[-4px] transition-transform duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-primary uppercase">
                      {project.year}
                    </span>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                      {categories.find((c) => c.id === project.category)?.labelEn}
                    </span>
                  </div>
                  <h3 className="font-amiri text-2xl md:text-3xl text-foreground mb-1">
                    {project.titleAr}
                  </h3>
                  <p className="font-display text-xs tracking-wider text-muted-foreground">
                    {project.titleEn} · {project.location}
                  </p>
                </div>

                {/* Top right index */}
                <div className="absolute top-4 right-4 text-[10px] font-inter tracking-widest text-primary/70">
                  {String(project.id).padStart(2, "0")}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <button className="group inline-flex items-center gap-3 px-8 py-4 border border-primary/40 text-primary rounded-full font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <Eye className="w-4 h-4" />
            استعرض المجموعة الكاملة
            <span className="text-xs opacity-60 font-inter">(+180 صورة)</span>
          </button>
        </motion.div>
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full grid md:grid-cols-2 gap-0 border border-border rounded-sm overflow-hidden bg-card"
            >
              <div className="relative aspect-[4/3] md:aspect-auto">
                <MotifSvg motif={selected.motif} palette={selected.palette} />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center text-right">
                <span className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-3">
                  {categories.find((c) => c.id === selected.category)?.labelEn} · {selected.year}
                </span>
                <h3 className="font-amiri text-4xl md:text-5xl text-foreground mb-3">
                  {selected.titleAr}
                </h3>
                <p className="font-display text-lg text-muted-foreground tracking-wider mb-6">
                  {selected.titleEn}
                </p>
                <div className="hairline w-16 mb-6" />
                <p className="text-muted-foreground leading-loose mb-6">
                  صورة من سلسلة {categories.find((c) => c.id === selected.category)?.labelAr} التقطتها
                  مريم في {selected.location}. تجمع اللقطة بين الضوء الطبيعي والحركة
                  العفوية لتوثيق لحظة لا تتكرر، وتروي حكاية إنسانية تتجاوز حدود
                  الإطار.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                      الموقع
                    </div>
                    <div className="font-amiri text-foreground mt-1">
                      {selected.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                      السنة
                    </div>
                    <div className="font-amiri text-foreground mt-1">
                      {selected.year}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image,
  Briefcase,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowLeft,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    testimonials: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects?all=1").then((r) => r.json()),
      fetch("/api/services?all=1").then((r) => r.json()),
      fetch("/api/testimonials?all=1").then((r) => r.json()),
    ])
      .then(([p, s, t]) => {
        setStats({
          projects: p.length || 0,
          services: s.length || 0,
          testimonials: t.length || 0,
          featured: p.filter((x: { featured?: boolean }) => x.featured).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      labelAr: "إجمالي الأعمال",
      value: stats.projects,
      icon: Image,
      href: "/admin/projects",
      color: "from-[oklch(0.78_0.13_75_/_0.2)] to-transparent",
    },
    {
      labelAr: "الخدمات النشطة",
      value: stats.services,
      icon: Briefcase,
      href: "/admin/services",
      color: "from-[oklch(0.55_0.1_40_/_0.2)] to-transparent",
    },
    {
      labelAr: "آراء العملاء",
      value: stats.testimonials,
      icon: MessageSquare,
      href: "/admin/testimonials",
      color: "from-[oklch(0.4_0.05_285_/_0.2)] to-transparent",
    },
    {
      labelAr: "أعمال مميزة",
      value: stats.featured,
      icon: TrendingUp,
      href: "/admin/projects",
      color: "from-[oklch(0.7_0.1_60_/_0.2)] to-transparent",
    },
  ];

  const quickActions = [
    { labelAr: "إضافة عمل جديد", href: "/admin/projects", icon: Plus },
    { labelAr: "تعديل القسم الرئيسي", href: "/admin/hero", icon: Eye },
    { labelAr: "تعديل بطاقة عن مريم", href: "/admin/about", icon: Eye },
    { labelAr: "تعديل معلومات التواصل", href: "/admin/contact", icon: Eye },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
          Dashboard
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          مرحباً بك، <span className="text-gold-gradient">مريم</span>
        </h1>
        <p className="text-muted-foreground">
          لوحة التحكم بإدارة محتوى موقعك. من هنا يمكنك تعديل كل شيء.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={c.href}
                className={`block relative p-6 bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/40 transition-colors group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-50`}
                />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="font-display text-3xl text-foreground font-bold mb-1">
                    {loading ? "—" : c.value}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide">
                    {c.labelAr}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-card border border-border/60 rounded-sm p-6"
      >
        <h2 className="font-amiri text-2xl text-foreground mb-5">
          إجراءات سريعة
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link
                key={i}
                href={a.href}
                className="flex items-center justify-between p-4 bg-background/40 border border-border/40 rounded-sm hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{a.labelAr}</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 rounded-sm"
      >
        <div className="flex items-start gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-amiri text-lg text-foreground mb-2">
              نصيحة سريعة
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              كل تعديل تقومين به يُحفظ مباشرة ويظهر على الموقع. لا حاجة
              للنشر يدوياً. يمكنك تجربة أي تعديل ثم معاينة الموقع عبر زر
              "عرض الموقع" في الأعلى.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Download,
  Upload,
  Loader2,
  AlertTriangle,
  RotateCcw,
  FileJson,
} from "lucide-react";
import { Toast, SectionCard } from "@/components/admin/Fields";

type ImportCounts = {
  projects: number;
  services: number;
  testimonials: number;
  philosophy: number;
};

export default function DataAdminPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [file, setFile] = useState<File | null>(null);
  const [lastExportAt, setLastExportAt] = useState<string | null>(null);

  const showToast = (m: string, type: "success" | "error" = "success") => {
    setToast(m);
    setToastType(type);
    setTimeout(() => setToast(""), 4000);
  };

  // Trigger a JSON file download in the browser
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/data/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maryam-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastExportAt(new Date().toLocaleString("ar-EG"));
      showToast("✓ تم تصدير البيانات بنجاح");
    } catch (err) {
      console.error("Export error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل التصدير: ${msg}`, "error");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast("اختاري ملف JSON أولاً", "error");
      return;
    }
    if (
      !confirm(
        "تحذير: الاستيراد سيستبدل كل البيانات الحالية بالكامل. هل أنت متأكدة؟"
      )
    )
      return;
    setImporting(true);
    try {
      const text = await file.text();
      // Validate JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("ملف JSON غير صالح");
      }
      const res = await fetch("/api/data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const counts = data.counts as ImportCounts;
      showToast(
        `✓ تم الاستيراد: ${counts.projects} عمل، ${counts.services} خدمة، ${counts.testimonials} رأي، ${counts.philosophy} بطاقة`
      );
      setFile(null);
    } catch (err) {
      console.error("Import error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل الاستيراد: ${msg}`, "error");
    } finally {
      setImporting(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "تحذير شديد: سيتم حذف كل البيانات الحالية واستبدالها بالقيم الافتراضية. لا يمكن التراجع! هل أنت متأكدة تماماً؟"
      )
    )
      return;
    if (!confirm("تأكيد أخير — هل أنت متأكدة من إعادة التعيين؟")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/data/reset", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      showToast("✓ تمت إعادة التعيين للقيم الافتراضية");
    } catch (err) {
      console.error("Reset error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل إعادة التعيين: ${msg}`, "error");
    } finally {
      setResetting(false);
    }
  };

  // Revoke file input value so the same file can be re-selected
  useEffect(() => {
    if (!file) {
      const input = document.getElementById("import-file") as HTMLInputElement | null;
      if (input) input.value = "";
    }
  }, [file]);

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
          Data & Backups
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          البيانات والنسخ الاحتياطي
        </h1>
        <p className="text-muted-foreground">
          صدّري بياناتك إلى ملف JSON أو استعيديها من نسخة سابقة.
        </p>
      </motion.div>

      {/* Export */}
      <SectionCard
        title="تصدير البيانات"
        description="نزّلي نسخة كاملة من كل المحتوى كملف JSON"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? "جاري التصدير..." : "تصدير JSON"}
          </button>
          <div className="text-sm text-muted-foreground">
            {lastExportAt ? (
              <span>آخر تصدير: {lastExportAt}</span>
            ) : (
              <span>لم يتم التصدير بعد في هذه الجلسة</span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Import */}
      <SectionCard
        title="استيراد البيانات"
        description="استعيدي البيانات من ملف JSON تم تصديره مسبقاً"
      >
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-200/90">
              تحذير: الاستيراد يستبدل كل البيانات الحالية بالكامل (إعدادات + أعمال + خدمات + آراء + بطاقات فلسفة).
              تأكدي من تصدير نسخة احتياطية أولاً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <label className="flex-1 flex items-center gap-3 px-4 py-3 border border-border rounded-sm cursor-pointer hover:border-primary/50 transition-colors bg-background/40">
              <FileJson className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {file ? file.name : "اختاري ملف JSON"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "ملف .json تم تصديره من هذا النظام"}
                </div>
              </div>
              <input
                id="import-file"
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                }}
              />
            </label>

            <button
              onClick={handleImport}
              disabled={importing || !file}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importing ? "جاري الاستيراد..." : "استيراد"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        title="منطقة الخطر"
        description="إعادة تعيين كل البيانات للقيم الافتراضية"
      >
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-200/90">
              تحذير شديد: هذه العملية تحذف كل المحتوى الحالي (الأعمال، الخدمات، الآراء، البطاقات، الإعدادات) وتعيد البيانات الافتراضية.
              لا يمكن التراجع. صدّري نسخة احتياطية أولاً!
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-5 py-2.5 border border-red-500/50 text-red-400 rounded-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {resetting ? "جاري إعادة التعيين..." : "إعادة التعيين للقيم الافتراضية"}
          </button>
        </div>
      </SectionCard>

      <div className="glass-card p-5 rounded-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-amiri text-lg text-foreground mb-1">
            عن النسخ الاحتياطي
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            يُنصح بتصدير نسخة احتياطية بشكل دوري (أسبوعياً) وحفظها في مكان آمن.
            ملف JSON يحتوي على كل البيانات النصية والإعدادات. الصور المرفوعة
            على Vercel Blob لها عنوان URL ثابت ويُشار إليها في الملف.
          </p>
        </div>
      </div>

      <Toast message={toast} type={toastType} />
    </div>
  );
}

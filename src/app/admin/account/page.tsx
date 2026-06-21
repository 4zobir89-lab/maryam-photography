"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Shield, KeyRound } from "lucide-react";
import {
  Field,
  SaveButton,
  SectionCard,
  Toast,
} from "@/components/admin/Fields";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (m: string, type: "success" | "error" = "success") => {
    setToast(m);
    setToastType(type);
    setTimeout(() => setToast(""), 4000);
  };

  const submit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("جميع الحقول مطلوبة", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("كلمة المرور الجديدة وتأكيدها غير متطابقين", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      showToast("✓ تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل التغيير: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
          Account & Security
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          الحساب والأمان
        </h1>
        <p className="text-muted-foreground">
          غيّري كلمة مرور لوحة التحكم. يُنصح بتغييرها بشكل دوري.
        </p>
      </motion.div>

      <SectionCard
        title="تغيير كلمة المرور"
        description="ستبقى الجلسة الحالية نشطة بعد التغيير"
      >
        <div className="space-y-4">
          <div className="relative">
            <Field
              label="كلمة المرور الحالية"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="••••••••"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="كلمة المرور الجديدة"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="6 أحرف على الأقل"
              hint="6 أحرف على الأقل"
            />
            <Field
              label="تأكيد كلمة المرور الجديدة"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton onSave={submit} loading={saving} label="تغيير كلمة المرور" />
        </div>
      </SectionCard>

      <div className="glass-card p-5 rounded-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-amiri text-lg text-foreground flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            نصائح أمان
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pr-5">
            <li>استخدمي كلمة مرور قوية تحتوي على أحرف وأرقام ورموز.</li>
            <li>لا تُشاركي بيانات الدخول مع أي شخص.</li>
            <li>بعد تغيير كلمة المرور، سيُطلب منك تسجيل الدخول مجدداً على الأجهزة الأخرى عند انتهاء صلاحية الجلسة.</li>
            <li>مدة الجلسة الحالية: 7 أيام.</li>
          </ul>
        </div>
      </div>

      <Toast message={toast} type={toastType} />
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useState } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card border border-border/60 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Accent bar */}
            <div
              className={`h-1 ${
                danger
                  ? "bg-gradient-to-r from-red-500 via-red-400 to-red-500"
                  : "bg-gradient-to-r from-primary via-primary/80 to-primary"
              }`}
            />

            <button
              onClick={() => !loading && onCancel()}
              className="absolute top-4 left-4 w-8 h-8 rounded-full hover:bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center">
              {/* Icon */}
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
                  danger
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-primary/10 border border-primary/30"
                }`}
              >
                <AlertTriangle
                  className={`w-7 h-7 ${
                    danger ? "text-red-400" : "text-primary"
                  }`}
                />
              </div>

              <h3 className="font-amiri text-2xl text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-sm mx-auto">
                {message}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
                    danger
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="px-6 py-3 border border-border text-muted-foreground rounded-md text-sm hover:text-foreground transition-colors"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

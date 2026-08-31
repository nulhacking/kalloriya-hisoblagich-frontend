import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ToastKind = "success" | "error" | "info" | "warn";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  leaving?: boolean;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: (m) => console.log("[toast]", m),
      success: (m) => console.log("[toast success]", m),
      error: (m) => console.warn("[toast error]", m),
      info: (m) => console.log("[toast info]", m),
    };
  }
  return ctx;
};

const KIND_STYLES: Record<ToastKind, { bg: string; icon: string }> = {
  success: {
    bg: "bg-emerald-600",
    icon: "✓",
  },
  error: {
    bg: "bg-red-500",
    icon: "!",
  },
  info: {
    bg: "bg-stone-900",
    icon: "i",
  },
  warn: {
    bg: "bg-amber-500",
    icon: "!",
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 240);
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, kind }]);
      window.setTimeout(() => dismiss(id), 2600);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  const toastLayer = (
    <div
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 16px)",
        zIndex: 10000,
      }}
    >
      {toasts.map((t) => {
        const s = KIND_STYLES[t.kind];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto ${t.leaving ? "animate-toast-out" : "animate-toast-in"} ${s.bg} text-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-3 max-w-[92vw]`}
            style={{ minWidth: 220 }}
          >
            <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center font-semibold text-sm">
              {s.icon}
            </span>
            <span className="font-semibold text-sm text-left leading-snug">{t.message}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(toastLayer, document.body)}
    </ToastContext.Provider>
  );
};

/** Hook that renders the provider when wrapping required */
export default ToastProvider;

// Convenience: auto-dismiss effect wrapper (unused now, kept for completeness)
export const useAutoDismiss = (onDismiss: () => void, delayMs: number) => {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, delayMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, delayMs]);
};

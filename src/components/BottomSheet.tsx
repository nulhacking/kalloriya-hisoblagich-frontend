import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  icon?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind height class e.g. "max-h-[85vh]" */
  maxHeight?: string;
  /** Add padding inside the content area */
  contentPadding?: boolean;
  /** Accent color for the drag handle (green default) */
  accent?: "green" | "orange" | "blue" | "red" | "neutral";
  /** If true, header uses a stronger gradient style */
  heroHeader?: boolean;
}

/** Aksent — faqat bitta tekis rang; gradient ishlatilmaydi. */
const ACCENT_MAP: Record<NonNullable<BottomSheetProps["accent"]>, string> = {
  green: "bg-emerald-600",
  orange: "bg-orange-500",
  blue: "bg-blue-600",
  red: "bg-red-500",
  neutral: "bg-stone-900",
};

const BottomSheet = ({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  maxHeight = "max-h-[88vh]",
  contentPadding = true,
  accent = "green",
  heroHeader = false,
}: BottomSheetProps) => {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
      return;
    }
    if (mounted) {
      setLeaving(true);
      timerRef.current = window.setTimeout(() => {
        setMounted(false);
        setLeaving(false);
      }, 260);
      return () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
      };
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;
  if (typeof document === "undefined") return null;

  const accentClass = ACCENT_MAP[accent];

  const sheet = (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          leaving ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
      />
      <div
        className={`relative w-full sm:max-w-lg bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col ${maxHeight} ${
          leaving ? "animate-sheet-down" : "animate-sheet-up"
        }`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1.5 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-stone-300"></div>
        </div>

        {/* Header */}
        {title && (
          <div
            className={`px-5 pt-1 pb-3 flex items-center gap-3 border-b border-stone-100 ${
              heroHeader ? `${accentClass} text-white` : "bg-white"
            }`}
          >
            {icon && (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                  heroHeader ? "bg-white/20" : "bg-stone-100"
                }`}
              >
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {typeof title === "string" ? (
                <h3
                  className={`text-base font-semibold truncate ${
                    heroHeader ? "text-white" : "text-stone-900"
                  }`}
                >
                  {title}
                </h3>
              ) : (
                title
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
                heroHeader
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div
          className={`flex-1 overflow-y-auto overscroll-contain ${
            contentPadding ? "px-5 pb-5" : ""
          }`}
        >
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="px-5 pt-3 pb-3 border-t border-stone-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
};

export default BottomSheet;

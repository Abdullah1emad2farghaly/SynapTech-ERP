// src/components/common/Drawer.tsx
//
// Generic, RTL-aware drawer shell. Used for any action that needs more
// room than a modal but is too frequent/lightweight to justify full
// navigation away (Create User, Assign Roles, etc.) — every specific
// drawer in the product is an instance of this shell, never a bespoke
// implementation.
//
// RTL note: CSS logical properties alone don't flip a JS-driven transform
// value (the animation offset), so direction is detected at runtime via
// document.documentElement.dir rather than assumed — this is exactly the
// class of bug that hit the Dashboard module when it didn't.
//
// Motion: 280ms cubic-bezier(0.16,1,0.3,1) for the open/close transition,
// matching the system's state-transition timing. Respects
// prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Drawer width. Defaults to a size comfortable for form content. */
  widthClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClassName = "w-full max-w-md",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  // Detect direction at runtime rather than assuming — logical CSS
  // properties handle layout mirroring automatically, but the JS-driven
  // slide offset below needs to know which side to animate from.
  useEffect(() => {
    setDirection(document.documentElement.dir === "rtl" ? "rtl" : "ltr");
  }, [open]);

  useEffect(() => {
    if (open) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      const id = requestAnimationFrame(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      });
      return () => cancelAnimationFrame(id);
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Slide from the visual "end" side — right in LTR, left in RTL — since
  // this is a transform value, not something logical properties resolve.
  const closedX = direction === "rtl" ? "-100%" : "100%";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" dir={direction}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className={`relative z-10 flex h-full flex-col bg-[var(--panel)] shadow-[var(--elevation-1)] ${widthClassName}`}
            initial={{ x: prefersReducedMotion ? 0 : closedX }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : closedX }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="flex items-start justify-between border-b border-[var(--hairline)] px-5 py-4">
              <div>
                <h2 id="drawer-title" className="text-base font-semibold text-[var(--ink-primary)]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-[var(--ink-tertiary)]">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

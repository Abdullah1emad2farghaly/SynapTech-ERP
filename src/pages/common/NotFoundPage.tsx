// path: src/pages/errors/NotFoundPage.tsx
import { useNavigate } from "react-router-dom"; // ASSUMPTION: react-router-dom v7 hook
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { Seo } from "@/components/common/Seo";

// Easy to change without hunting through the component.

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();


  return (
    <>
      <Seo
        title="Page Not Found | SynapTech ERP"
        description="The requested page could not be found."
        robots="noindex, nofollow"
      />


      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas px-4 py-16">
        {/* Decorative background: subtle dot grid + soft glow, purely presentational */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-hairline, currentColor) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.35,
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 80%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 start-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-synapse/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [0.98, 1.02, 0.98] }}
          transition={{ opacity: { duration: 0.6 }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
        />

        <div className="relative w-full max-w-lg text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="font-display text-[clamp(4.5rem,14vw,7.5rem)] leading-none font-semibold tracking-tight text-ink-primary"
          >
            404
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.08 }}
            className="mt-4 text-xl font-semibold text-ink-primary"
          >
            {t("errors.notFound.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.14 }}
            className="mt-2 text-sm text-ink-tertiary leading-relaxed max-w-sm mx-auto"
          >
            {t("errors.notFound.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-signal hover:bg-signal-hover text-white px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse/40"
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              {t("errors.notFound.backToDashboard")}
            </button>

            {/* {canGoBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-panel px-5 py-2.5 text-sm font-medium text-ink-primary hover:bg-sunken transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse/40"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("errors.notFound.goBack")}
            </button>
          )} */}
          </motion.div>
        </div>
      </div>
    </>
  );
}

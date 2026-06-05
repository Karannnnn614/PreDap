import { Fragment } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Brain, Eye, Lock } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

/**
 * Technology — the inverted (dark) "Architecture" section.
 *
 * A deliberate contrast moment in the scroll: deep slate canvas, light text,
 * dot-grid texture and ambient brand glows. Lays out PreDAP's three-tier
 * pipeline as translucent cards connected by arrow badges — in a row on
 * desktop, stacked on mobile.
 */

interface Tier {
  label: string;
  title: string;
  description: string;
  icon: typeof Eye;
}

const TIERS: Tier[] = [
  {
    icon: Eye,
    label: "Tier 1 · On-device",
    title: "Pixel Analyzer (Edge Model)",
    description:
      "A lightweight on-device model captures and interprets UI elements in real time — understanding what's on screen without touching sensitive data.",
  },
  {
    icon: Lock,
    label: "Tier 2 · Private",
    title: "Abstracter Model (Edge Model)",
    description:
      "Transforms detailed UI data into abstracted, privacy-protected signals, so personal data never leaves your device.",
  },
  {
    icon: Brain,
    label: "Tier 3 · Gemini",
    title: "Big AI (Cloud Model)",
    description:
      "Gemini orchestrates multi-step tasks and generates guidance using only the abstracted context — privacy preserved, intelligence delivered.",
  },
];

/** Brand badge that links two tiers — arrow points down on mobile, right on desktop. */
const Connector = () => (
  <div
    className="flex shrink-0 items-center justify-center self-center py-2 lg:px-2 lg:py-0"
    aria-hidden="true"
  >
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-secondary text-white shadow-accent">
      <ArrowDown className="h-4 w-4 lg:hidden" />
      <ArrowRight className="hidden h-4 w-4 lg:block" />
    </div>
  </div>
);

const Technology = () => {
  return (
    <section
      id="technology"
      className="relative section-spacing overflow-hidden bg-foreground text-background"
    >
      {/* Dot-grid texture — felt, not seen */}
      <div className="dot-pattern pointer-events-none absolute inset-0 -z-0 opacity-[0.04]" />

      {/* Ambient brand glows at opposing corners */}
      <div className="pointer-events-none absolute -left-32 -top-32 -z-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 -z-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[150px]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="container-section relative z-10"
      >
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeInUp}>
            <SectionLabel tone="dark">The Architecture</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.1] text-white sm:text-5xl"
          >
            One pipeline.{" "}
            <span className="gradient-text">Three intelligent tiers.</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            PreDAP's three layers run in sequence — delivering intelligent
            guidance while sensitive data never leaves your device.
          </motion.p>
        </div>

        {/* Tier pipeline — row on desktop, stack on mobile */}
        <div className="mt-16 flex flex-col items-stretch lg:mt-20 lg:flex-row lg:items-stretch">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <Fragment key={tier.label}>
                <motion.div
                  variants={fadeInUp}
                  className="group flex h-full flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors duration-300 hover:border-brand/40 hover:bg-white/[0.07]"
                >
                  {/* Icon + tier badge */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-secondary text-white shadow-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
                        {tier.label}
                      </span>
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {tier.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {tier.description}
                  </p>
                </motion.div>

                {i < TIERS.length - 1 && <Connector />}
              </Fragment>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default Technology;

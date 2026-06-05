import { motion } from "framer-motion";
import {
  Monitor,
  Eye,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  Lock,
} from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

/**
 * Technology — the animated 3-tier architecture systems diagram.
 *
 * A vertical pipeline: live screen → Tier 1 (edge analysis) → Tier 2 (privacy
 * abstraction, with PII masking visualized) → device/cloud boundary → Tier 3
 * (cloud reasoning). Marching-dash connectors carry a glowing data packet
 * downward. This is the trust argument made visual: only abstracted context
 * ever crosses the boundary.
 */

/** A connector between two nodes: animated dashed beam + a glowing packet + a label. */
const Flow = ({ label }: { label: string }) => (
  <div className="relative flex h-16 items-center justify-center" aria-hidden="true">
    <svg width="2" height="64" className="overflow-visible">
      <line
        x1="1"
        y1="0"
        x2="1"
        y2="64"
        stroke="url(#flowGrad)"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="animate-dash-flow"
      />
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D6BFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
    {/* Glowing data packet travelling down */}
    <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 animate-flow-down rounded-full bg-brand-cyan shadow-glow-cyan" />
    <span className="absolute left-1/2 ml-3 -translate-x-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </span>
  </div>
);

const Technology = () => {
  return (
    <section
      id="technology"
      className="relative section-spacing overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand/10 blur-[160px]" />

      <div className="container-section">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel pulse>The Architecture</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.1] sm:text-5xl"
          >
            One pipeline.{" "}
            <span className="gradient-text">Three intelligent tiers.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 text-lg leading-relaxed text-muted-foreground"
          >
            Data flows top-to-bottom — but only abstracted context ever crosses
            the boundary to the cloud. Privacy isn't a setting; it's the
            architecture.
          </motion.p>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-12 max-w-xl"
        >
          {/* Source — the live screen */}
          <motion.div
            variants={fadeInUp}
            className="surface-card mx-auto flex w-fit items-center gap-3 px-5 py-3"
          >
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Live screen</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              any web app
            </span>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Flow label="raw pixels + DOM" />
          </motion.div>

          {/* Tier 1 — Edge UI Analyzer */}
          <motion.div variants={fadeInUp}>
            <TierCard
              tier="Tier 01 · On-device"
              icon={Eye}
              title="Pixel / Edge UI Analyzer"
              description="A lightweight on-device model reads and interprets UI elements in real time — what's on screen, never the data behind it."
              status="Edge"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Flow label="structured UI map" />
          </motion.div>

          {/* Tier 2 — Privacy Abstractor (with masking viz) */}
          <motion.div variants={fadeInUp}>
            <TierCard
              tier="Tier 02 · On-device"
              icon={ShieldCheck}
              title="Privacy Abstractor"
              description="Strips and masks every piece of sensitive data locally, turning real values into safe abstractions."
              status="Private"
            >
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/40 p-3">
                <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
                  <span className="text-muted-foreground">john@acme.com</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-brand-cyan" />
                  <span className="text-brand-cyan">••••••@••••</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px]">
                  <span className="text-muted-foreground">4242 4242 4242</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-brand-cyan" />
                  <span className="text-brand-cyan">•••• •••• ••••</span>
                </div>
              </div>
            </TierCard>
          </motion.div>

          {/* Device / cloud boundary */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-3 py-5"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-cyan">
              <Lock className="h-3 w-3" /> only abstractions leave your device
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>

          {/* Tier 3 — Cloud AI */}
          <motion.div variants={fadeInUp}>
            <TierCard
              tier="Tier 03 · Cloud"
              icon={BrainCircuit}
              title="Big AI — Gemini"
              description="Gemini reasons over the abstracted context, orchestrates multi-step tasks, and streams step-by-step guidance back to the user."
              status="Gemini"
              cloud
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

interface TierCardProps {
  tier: string;
  icon: typeof Eye;
  title: string;
  description: string;
  status: string;
  cloud?: boolean;
  children?: React.ReactNode;
}

const TierCard = ({
  tier,
  icon: Icon,
  title,
  description,
  status,
  cloud,
  children,
}: TierCardProps) => (
  <div className="surface-card group p-6 hover:border-brand/40 hover:shadow-glow-lg">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-secondary text-white shadow-glow">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-secondary">
            {tier}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5">
            <span
              className={`h-1.5 w-1.5 animate-pulse-dot rounded-full ${
                cloud ? "bg-brand" : "bg-brand-cyan"
              }`}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              {status}
            </span>
          </span>
        </div>
        <h3 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </div>
  </div>
);

export default Technology;

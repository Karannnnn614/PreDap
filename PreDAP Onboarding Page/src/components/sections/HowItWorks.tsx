import { motion } from "framer-motion";
import {
  ArrowRight,
  DownloadCloud,
  ScanLine,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: DownloadCloud,
    title: "Install & Activate",
    description:
      "Add the PreDAP browser extension and activate it whenever you need guidance.",
  },
  {
    icon: ScanLine,
    title: "Analyze Interface",
    description:
      "The Pixel Analyzer captures and understands on-screen UI elements in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Abstract Data",
    description:
      "Sensitive information is abstracted on your device, preserving privacy with full context.",
  },
  {
    icon: Sparkles,
    title: "Receive Guidance",
    description:
      "Get clear, step-by-step instructions from the AI to finish your task efficiently.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-spacing">
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
            <SectionLabel>How It Works</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.1] sm:text-5xl"
          >
            From screen to step in{" "}
            <span className="gradient-text">four moves</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-5 text-lg text-muted-foreground"
          >
            From the first screen capture to task completion, PreDAP guides each
            step with AI-generated assistance.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative mt-16 grid gap-10 md:mt-20 md:grid-cols-4 md:gap-6"
        >
          {/* Connecting line — desktop: horizontal across, mobile: vertical at left */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[1.75rem] top-2 bottom-2 w-px bg-gradient-to-b from-brand/40 via-border to-transparent md:left-[12.5%] md:right-[12.5%] md:top-7 md:bottom-auto md:h-px md:w-auto md:bg-gradient-to-r md:from-transparent md:via-border md:to-transparent"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <motion.li
                key={step.title}
                variants={fadeInUp}
                className="relative flex items-start gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
              >
                {/* Numbered node */}
                <div className="relative z-10 flex flex-col items-center md:w-full">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-secondary text-white shadow-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="mt-3 font-display text-4xl leading-none gradient-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Copy */}
                <div className="md:mt-4">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector badge between steps — desktop only */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute right-[-0.875rem] top-4 z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-brand/30 bg-background text-brand shadow-sm md:flex"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
};

export default HowItWorks;

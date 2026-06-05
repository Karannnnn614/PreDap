import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Cpu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionLabel from "@/components/SectionLabel";
import ProductPreview from "@/components/ProductPreview";
import { fadeInUp, scaleIn, stagger, viewportOnce } from "@/lib/motion";

const trust = [
  { icon: Lock, label: "Privacy-first" },
  { icon: Cpu, label: "On-device AI" },
  { icon: ShieldCheck, label: "3-tier system" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      {/* Atmospheric brand glow in the corner */}
      <div className="pointer-events-none absolute -top-32 right-0 -z-10 h-[480px] w-[480px] rounded-full bg-brand/10 blur-[150px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container-section">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* Left — message (text column is intentionally dominant) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp}>
              <SectionLabel pulse>AI-Driven Onboarding</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.5rem]"
            >
              Onboard anyone into any tool,{" "}
              <span className="relative inline-block">
                <span className="gradient-text">privately.</span>
                <span className="gradient-underline" />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
            >
              PreDAP is an AI copilot that reads the screen, understands the UI
              in real time, and walks users through complex tasks step by step —
              abstracting sensitive data on-device so nothing private ever leaves
              the browser.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-9 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button asChild variant="gradient" size="xl" className="group w-full sm:w-auto">
                <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                  Try PreDAP Now
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </motion.div>

            <motion.ul
              variants={fadeInUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start"
            >
              {trust.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-brand" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right — animated product demo (hidden on small screens) */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <ProductPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-secondary text-white py-24 md:py-32">
      {/* Subtle texture + soft radial glow */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-[160px]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="container-section relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* Translucent label pill */}
        <motion.span
          variants={fadeInUp}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-white" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Get Started
        </motion.span>

        <motion.h2
          variants={fadeInUp}
          className="mt-6 text-4xl leading-[1.1] text-white sm:text-5xl"
        >
          Ready to transform how your team onboards?
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/85 leading-relaxed"
        >
          Join forward-thinking teams using PreDAP to automate onboarding and
          streamline complex tasks.
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-10 flex justify-center">
          <Button
            asChild
            size="xl"
            className="group bg-white text-brand hover:bg-white/90 hover:-translate-y-0.5"
          >
            <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
              Try PreDAP Now
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTA;

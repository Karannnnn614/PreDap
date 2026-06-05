import { motion } from "framer-motion";
import { ArrowRight, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, scaleIn, stagger, viewportOnce } from "@/lib/motion";

const Roadmap = () => {
  return (
    <section id="roadmap" className="section-spacing">
      <div className="container-section">
        {/* Header — kept narrow and centered for confident focus. */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel pulse>Roadmap</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.15] md:text-5xl"
          >
            Built for the browser —{" "}
            <span className="gradient-text">expanding to your desktop</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg leading-relaxed text-muted-foreground"
          >
            PreDAP keeps evolving. Here's what's coming next.
          </motion.p>
        </motion.div>

        {/* Featured card — gradient-border technique for the marquee item. */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-16 max-w-3xl"
        >
          <motion.div
            variants={scaleIn}
            className="rounded-2xl bg-gradient-to-br from-brand via-brand-secondary to-brand p-[2px] shadow-accent-lg"
          >
            <div className="rounded-[calc(1rem-2px)] bg-card p-8 md:p-10">
              {/* Coming Soon pill */}
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand to-brand-secondary px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-white shadow-accent">
                Coming Soon
              </span>

              <div className="mt-6 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:gap-8 md:text-left">
                {/* Large gradient icon box */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-secondary text-white shadow-accent">
                  <MonitorSmartphone className="h-10 w-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold">Desktop Application</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                    We're bringing AI-driven guidance beyond the browser to every
                    app on your machine — broader workflow support, deeper
                    context, and the same privacy-first core.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Closing note + primary CTA */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center gap-6 text-center"
          >
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              The browser extension is just the beginning — try it today and join
              the journey.
            </p>
            <Button asChild variant="gradient" size="lg" className="group">
              <a
                href="https://predap.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try PreDAP Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Roadmap;

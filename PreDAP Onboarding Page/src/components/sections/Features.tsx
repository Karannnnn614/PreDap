import { motion } from "framer-motion";
import { Rocket, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Rocket,
    title: "Enhanced Productivity",
    description:
      "Automate repetitive tasks and cut manual effort, so your team can focus on high-value work.",
  },
  {
    icon: Sparkles,
    title: "Effortless Onboarding",
    description:
      "Guide new users through complex workflows with step-by-step AI assistance that adapts to their needs.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-First Design",
    description:
      "PreDAP abstracts UI data on-device to protect sensitive information while still delivering actionable guidance.",
  },
];

const Features = () => {
  return (
    <section id="product" className="section-spacing">
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
            <SectionLabel>Product</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.15] md:text-5xl"
          >
            Supercharge your{" "}
            <span className="gradient-text">digital workflows</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg leading-relaxed text-muted-foreground"
          >
            PreDAP leverages cutting-edge AI to streamline complex tasks and
            guide users through digital processes with ease and efficiency.
          </motion.p>
        </motion.div>

        {/* Clean, balanced 3-up grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.article
              key={title}
              variants={fadeInUp}
              className="group surface-card relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow"
            >
              {/* Subtle brand wash that surfaces on hover. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-secondary text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

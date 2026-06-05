import { motion } from "framer-motion";
import { Puzzle, UploadCloud, UserX, type LucideIcon } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

interface Pain {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * The problem these pains are deliberately rendered in neutral gray — the
 * "before". Every solution section that follows uses Electric Blue. That colour
 * contrast IS the argument: dull, broken status quo → vivid, privacy-first PreDAP.
 */
const pains: Pain[] = [
  {
    icon: Puzzle,
    title: "Rigid & brittle",
    description:
      "Hard-coded walkthroughs break the moment the interface changes — so guidance is always out of date.",
  },
  {
    icon: UploadCloud,
    title: "Privacy-hostile",
    description:
      "Screen contents and personal data get shipped to the cloud just to render a tooltip.",
  },
  {
    icon: UserX,
    title: "One-size-fits-none",
    description:
      "Static tours ignore who the user is and what they're actually trying to accomplish right now.",
  },
];

const Problem = () => {
  return (
    <section className="relative border-y border-border bg-muted/40 section-spacing">
      <div className="container-section">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel>The Problem</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.15] md:text-5xl"
          >
            Onboarding into complex tools is{" "}
            <span className="gradient-text">still broken</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg leading-relaxed text-muted-foreground"
          >
            Most digital adoption platforms are rigid, blind to UI changes, and
            hungry for data. Users get generic tooltips — and hand over
            everything to the cloud just to receive them.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {pains.map(({ icon: Icon, title, description }) => (
            <motion.article
              key={title}
              variants={fadeInUp}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </motion.div>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 text-center text-lg font-medium"
        >
          PreDAP was built to fix all three.
        </motion.p>
      </div>
    </section>
  );
};

export default Problem;

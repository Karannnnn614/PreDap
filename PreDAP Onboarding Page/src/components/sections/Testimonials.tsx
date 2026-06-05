import { motion } from "framer-motion";
import SectionLabel from "@/components/SectionLabel";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "PreDAP cut our onboarding time in half. New team members navigate our complex systems with confidence from day one.",
    name: "Sarah Johnson",
    initials: "SJ",
    role: "HR Director, TechCorp",
  },
  {
    quote:
      "The privacy-first approach was crucial for us. PreDAP delivers intelligent guidance without compromising sensitive data.",
    name: "Michael Chen",
    initials: "MC",
    role: "CTO, SecureFinance",
  },
  {
    quote:
      "I was skeptical about AI assistants, but PreDAP's accuracy and contextual understanding is impressive — like an expert guide by your side.",
    name: "Elena Rodriguez",
    initials: "ER",
    role: "Operations Manager, GlobalRetail",
  },
];

const Testimonials = () => {
  return (
    <section className="section-spacing">
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
            <SectionLabel>Testimonials</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="mt-6 text-4xl leading-[1.15] md:text-5xl"
          >
            Teams onboard faster with{" "}
            <span className="gradient-text">PreDAP</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg leading-relaxed text-muted-foreground"
          >
            Hear from professionals who transformed their workflows.
          </motion.p>
        </motion.div>

        {/* Cards — asymmetric grid: center card floats up on md+ for rhythm. */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {testimonials.map(({ quote, name, initials, role }, index) => (
            <motion.article
              key={name}
              variants={fadeInUp}
              className={`surface-card relative overflow-hidden p-8 ${
                index === 1 ? "md:-translate-y-6" : ""
              }`}
            >
              {/* Gradient accent bar pinned to the top edge. */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-brand-secondary" />

              {/* Decorative quote glyph. */}
              <span
                aria-hidden="true"
                className="block font-display text-6xl leading-none text-brand/20"
              >
                &ldquo;
              </span>

              <blockquote className="-mt-4 text-lg leading-relaxed text-foreground/90">
                {quote}
              </blockquote>

              {/* Author block. */}
              <figcaption className="mt-6 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-secondary text-sm font-semibold text-white shadow-accent"
                >
                  {initials}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold">{name}</span>
                  <span className="text-sm text-muted-foreground">{role}</span>
                </span>
              </figcaption>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

import { motion } from "framer-motion";
import { ArrowUpRight, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { fadeInUp, stagger, viewportOnce } from "@/lib/motion";

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "X / Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "https://github.com/Karannnnn614/PreDap" },
  { icon: Mail, label: "Email", href: "mailto:hello@predap.ai" },
];

const productLinks = [
  { label: "Overview", href: "#product" },
  { label: "Technology", href: "#technology" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roadmap", href: "#roadmap" },
];

const legalLinks = [
  { label: "Terms of Use", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Security", href: "#" },
];

const FooterLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
    {children}
  </h3>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-background">
      {/* ============ CTA BAND ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-secondary">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-[360px] w-[360px] rounded-full bg-white/10 blur-[120px]" />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="container-section relative z-10 flex flex-col gap-10 py-16 md:flex-row md:items-end md:justify-between md:py-24"
        >
          <div>
            <motion.p
              variants={fadeInUp}
              className="font-mono text-xs uppercase tracking-[0.22em] text-white/70"
            >
              / Ready when you are
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-tight text-white/85 sm:text-6xl md:text-7xl"
            >
              Let&apos;s make onboarding
              <br />
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                effortless.
                <ArrowUpRight
                  className="h-8 w-8 md:h-11 md:w-11"
                  strokeWidth={2.2}
                />
              </span>
            </motion.h2>
          </div>

          <motion.a
            variants={fadeInUp}
            href="https://predap.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b border-white/40 pb-1 text-lg font-medium text-white transition-colors hover:border-white md:self-auto"
          >
            Try PreDAP Now
            <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </motion.div>
      </div>

      {/* ============ FOOTER BODY ============ */}
      <div className="relative">
        <div className="pointer-events-none absolute -top-16 left-1/3 h-[340px] w-[340px] rounded-full bg-brand/10 blur-[150px]" />

        <div className="container-section relative z-10 pt-16">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Follow + legal */}
            <div>
              <FooterLabel>Follow</FooterLabel>
              <div className="mt-4 flex gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-all hover:border-brand/40 hover:text-foreground hover:shadow-glow"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                © {year} PreDAP · All rights reserved.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                {legalLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Built by the 8 bits team — predap.ai
              </p>
            </div>

            {/* Product */}
            <div>
              <FooterLabel>Product</FooterLabel>
              <ul className="mt-4 space-y-3">
                {productLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <FooterLabel>Contact</FooterLabel>
              <a
                href="mailto:hello@predap.ai"
                className="mt-4 block font-medium text-foreground transition-colors hover:text-brand-secondary"
              >
                hello@predap.ai
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                We reply within 24 hours
              </p>
              <p className="text-sm text-muted-foreground">Mon–Fri, global</p>
            </div>
          </div>
        </div>

        {/* Oversized wordmark, bleeding off the bottom edge */}
        <div
          className="relative z-10 mt-12 overflow-hidden px-4 sm:px-6 lg:px-8"
          aria-hidden="true"
        >
          <div
            className="-mb-[0.16em] whitespace-nowrap bg-gradient-to-r from-foreground via-brand-secondary to-brand bg-clip-text text-center font-display font-bold leading-[0.78] tracking-tighter text-transparent"
            style={{ fontSize: "clamp(2.25rem, 19.5vw, 16rem)" }}
          >
            PreDAP-AI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

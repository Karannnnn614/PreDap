import { Button } from "@/components/ui/button";

const productLinks = [
  { label: "Overview", href: "#product" },
  { label: "Technology", href: "#technology" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roadmap", href: "#roadmap" },
];

const companyLinks = [
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-background">
      {/* Subtle grid texture + brand glow */}
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[150px]" />

      <div className="container-section relative z-10 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-semibold tracking-tight">
              <span className="text-foreground">Pre</span>
              <span className="gradient-text">DAP</span>
            </div>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              PreDAP uses advanced 3-tier AI to automate onboarding and reduce
              the burden of complex, repetitive tasks — while keeping data
              private and on-device.
            </p>
            <Button asChild variant="gradient" className="mt-6">
              <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                Try PreDAP Now
              </a>
            </Button>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-brand-secondary">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-brand-secondary">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-14 border-t border-white/[0.06] pt-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PreDAP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";

// Below-the-fold sections are code-split so the initial load only ships the
// navbar + hero (the LCP path). The rest — along with the framer-motion code
// they pull in — stream in lazily as the visitor scrolls.
const Problem = lazy(() => import("@/components/sections/Problem"));
const Features = lazy(() => import("@/components/sections/Features"));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks"));
const Technology = lazy(() => import("@/components/sections/Technology"));
const Roadmap = lazy(() => import("@/components/sections/Roadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Promise + live product demo */}
        <Hero />
        <Suspense fallback={null}>
          {/* Why this matters — the broken status quo */}
          <Problem />
          {/* The payoff — what PreDAP delivers */}
          <Features />
          {/* How simple it is to use */}
          <HowItWorks />
          {/* The privacy-first architecture under the hood (trust) */}
          <Technology />
          {/* Where it's headed */}
          <Roadmap />
        </Suspense>
      </main>
      {/* Final CTA band + footer + oversized wordmark */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;

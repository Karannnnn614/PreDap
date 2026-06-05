import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Technology from "@/components/sections/Technology";
import Roadmap from "@/components/sections/Roadmap";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Promise + live product demo */}
        <Hero />
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
      </main>
      {/* Final CTA band + footer + oversized wordmark */}
      <Footer />
    </div>
  );
};

export default Index;

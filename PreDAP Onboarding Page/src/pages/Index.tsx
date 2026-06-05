import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import TechnologyCard from '@/components/TechnologyCard';
import StepCard from '@/components/StepCard';
import TestimonialCard from '@/components/TestimonialCard';
import { 
  Brain, 
  Cpu, 
  Eye, 
  LineChart, 
  Lock, 
  MonitorSmartphone,
  Rocket, 
  Shield, 
  Zap 
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col hack-gradient-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-600/10 to-orange-500/5 pointer-events-none"></div>
        <div className="container-section relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-4 text-sm font-medium py-1 px-4 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700">
              Developed by 8 bits Team
            </div>
            <h1 className="font-bold mb-6">
              <span className="gradient-text">Empower Your Workflow</span> <br />
              with AI-Driven Guidance
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              PreDap uses advanced AI to automate onboarding and reduce the burden of complex,
              repetitive tasks while maintaining complete data privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-lg">
                <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                  Try PreDap Now
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg border-blue-200 hover:bg-blue-50">
                <a href="#how-it-works">
                  See How It Works
                </a>
              </Button>
            </div>
            <div className="mt-16 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl animate-fade-in">
              <div className="relative w-full pt-[56.25%] bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl overflow-hidden">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/Recording 2025-04-06 095208.mp4"
                  controls
                  preload="metadata"
                  poster="/placeholder.svg"
                >
                  <source src="/Recording 2025-04-06 095208.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Overview */}
      <section id="product" className="section-spacing bg-white">
        <div className="container-section">
          <h2 className="section-title">Supercharge Your Digital Workflows</h2>
          <p className="section-subtitle">
            PreDap leverages cutting-edge AI to streamline complex tasks and guide users through digital processes with ease and efficiency.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <FeatureCard 
              title="Enhanced Productivity"
              description="Automate repetitive tasks and reduce manual effort, allowing your team to focus on high-value work."
              icon={Rocket}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <FeatureCard 
              title="Effortless Onboarding"
              description="Guide new users through complex workflows with step-by-step AI assistance that adapts to their needs."
              icon={LineChart}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-100"
            />
            <FeatureCard 
              title="Privacy-First Design"
              description="Our technology abstracts UI data to protect sensitive information while still providing actionable guidance."
              icon={Shield}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-100"
            />
          </div>
        </div>
      </section>
      
      {/* Technology Section */}
      <section id="technology" className="section-spacing bg-gray-50">
        <div className="container-section">
          <div className="mb-4 text-sm font-medium py-1 px-4 rounded-full bg-gradient-to-r from-red-100 to-blue-100 text-red-700 inline-block mx-auto">
            Hack the Protocol
          </div>
          <h2 className="section-title">Our Three-Tiered AI System</h2>
          <p className="section-subtitle">
            PreDap's advanced architecture works seamlessly together to deliver intelligent guidance while preserving privacy and security.
          </p>
          
          <div className="space-y-10 mt-12">
            <TechnologyCard
              title="Pixel Analyzer (Edge Model)"
              description="Our lightweight edge model captures and processes real-time UI elements, understanding what's displayed on your screen without requiring access to sensitive data."
              icon={Eye}
              iconColor="text-blue-600"
              direction="left"
            />
            <TechnologyCard
              title="Abstracter Model (Edge Model)"
              description="This innovative model transforms detailed UI data into abstracted, privacy-protected information, ensuring your sensitive data never leaves your device."
              icon={Lock}
              iconColor="text-blue-500"
              direction="left"
            />
            <TechnologyCard
              title="Big AI (Cloud Model)"
              description="Our powerful cloud AI orchestrates sequential tasks and provides intelligent guidance, working with only the abstracted data to maintain privacy while delivering exceptional results."
              icon={Brain}
              iconColor="text-orange-500"
              direction="left"
            />
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="section-spacing bg-white">
        <div className="container-section">
          <h2 className="section-title">How PreDap Works</h2>
          <p className="section-subtitle">
            From initial screen capture to task completion, PreDap guides you through each step of your workflow with AI-generated assistance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
            <StepCard
              number={1}
              title="Install & Activate"
              description="Add the PreDap browser extension to your preferred browser and activate it when you need guidance."
            />
            <StepCard
              number={2}
              title="Analyze Interface"
              description="PreDap's Pixel Analyzer captures and understands UI elements on your screen in real-time."
            />
            <StepCard
              number={3}
              title="Abstract Data"
              description="Sensitive information is abstracted on your device, ensuring privacy while retaining contextual understanding."
            />
            <StepCard
              number={4}
              title="Receive Guidance"
              description="Get clear, step-by-step instructions from our AI to complete your task efficiently."
            />
          </div>
        </div>
      </section>
      
      {/* Roadmap Section */}
      <section id="roadmap" className="section-spacing bg-gray-50">
        <div className="container-section">
          <div className="mb-4 text-sm font-medium py-1 px-4 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 inline-block mx-auto">
            Roadmap by 8 bits
          </div>
          <h2 className="section-title">Product Evolution & Roadmap</h2>
          <p className="section-subtitle">
            PreDap is continuously evolving to better serve your needs. Here's what's coming next.
          </p>
          
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="hack-card p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-100 to-orange-100 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 text-sm font-medium mb-4">
                    Coming Soon
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Desktop Application</h3>
                  <p className="text-muted-foreground">
                    We're expanding PreDap beyond the browser with a powerful desktop application that will bring AI-driven guidance to all your applications. Stay tuned for enhanced capabilities and broader workflow support.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              The current browser extension is just the beginning. 
              Try it today and be part of our journey!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0">
              <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                Try PreDap Now
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section-spacing bg-white">
        <div className="container-section">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Hear from professionals who have transformed their workflows with PreDap.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <TestimonialCard
              quote="PreDap cut our onboarding time in half. New team members can navigate our complex systems with confidence from day one."
              author="Sarah Johnson"
              role="HR Director, TechCorp"
            />
            <TestimonialCard
              quote="The privacy-first approach was crucial for our organization. PreDap delivers intelligent guidance without compromising sensitive data."
              author="Michael Chen"
              role="CTO, SecureFinance"
            />
            <TestimonialCard
              quote="I was skeptical about AI assistants, but PreDap's accuracy and contextual understanding is impressive. It's like having an expert guide by your side."
              author="Elena Rodriguez"
              role="Operations Manager, GlobalRetail"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container-section">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 text-sm font-medium py-1 px-4 rounded-full bg-white/20 text-white inline-block">
              Powered by 8 bits
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join forward-thinking teams already using PreDap to automate onboarding and streamline complex tasks.
            </p>
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-white/90 text-lg">
              <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                Try PreDap Now
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

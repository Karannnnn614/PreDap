
import React from 'react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-predap-dark text-white">
      <div className="container-section py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="font-bold text-2xl mb-4">
              <span className="text-predap-teal">Pre</span>
              <span className="text-white">Dap</span>
            </div>
            <p className="text-white/70 mb-6 max-w-md">
              PreDap employs advanced AI technology to automate onboarding and reduce the burden 
              of complex, repetitive tasks while maintaining data privacy and security.
            </p>
            <Button asChild className="bg-predap-purple hover:bg-predap-purple/90">
              <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                Try PreDap Now
              </a>
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#product" className="text-white/70 hover:text-white transition-colors">Overview</a></li>
              <li><a href="#technology" className="text-white/70 hover:text-white transition-colors">Technology</a></li>
              <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#roadmap" className="text-white/70 hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 text-center md:text-left">
          <p className="text-white/50">
            &copy; {currentYear} PreDap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

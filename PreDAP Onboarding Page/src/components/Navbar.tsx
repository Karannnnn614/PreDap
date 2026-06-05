
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-section py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-2xl">
              <span className="text-predap-purple">Pre</span>
              <span className="text-predap-blue">Dap</span>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-foreground/80 hover:text-predap-purple transition-colors">Product</a>
            <a href="#technology" className="text-foreground/80 hover:text-predap-purple transition-colors">Technology</a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-predap-purple transition-colors">How It Works</a>
            <a href="#roadmap" className="text-foreground/80 hover:text-predap-purple transition-colors">Roadmap</a>
            <Button asChild className="bg-predap-purple hover:bg-predap-purple/90">
              <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                Try PreDap Now
              </a>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#product" className="text-foreground/80 hover:text-predap-purple transition-colors py-2" onClick={toggleMobileMenu}>Product</a>
              <a href="#technology" className="text-foreground/80 hover:text-predap-purple transition-colors py-2" onClick={toggleMobileMenu}>Technology</a>
              <a href="#how-it-works" className="text-foreground/80 hover:text-predap-purple transition-colors py-2" onClick={toggleMobileMenu}>How It Works</a>
              <a href="#roadmap" className="text-foreground/80 hover:text-predap-purple transition-colors py-2" onClick={toggleMobileMenu}>Roadmap</a>
              <Button asChild className="bg-predap-purple hover:bg-predap-purple/90 w-full">
                <a href="https://predap.ai" target="_blank" rel="noopener noreferrer">
                  Try PreDap Now
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

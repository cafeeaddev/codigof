import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const container = document.querySelector('[data-internal-scroll]') as HTMLElement | null;

    const getScrollTop = () => (container ? container.scrollTop : (window.scrollY || window.pageYOffset));
    const handleScroll = () => {
      setIsScrolled(getScrollTop() > 50);
    };

    // Initial state
    handleScroll();

    const target: any = container ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Missões', href: '#missions' },
    { name: 'Sobre', href: '#about' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/20 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-start h-12 sm:h-14 lg:h-16">
          {/* Navigation content can be added here if needed */}
        </div>
      </div>
    </nav>
  );
};
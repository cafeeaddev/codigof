import { useEffect } from 'react';

export const AccessibilityEnhancer = () => {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      // Skip to main content with Ctrl+Enter
      if (e.ctrlKey && e.key === 'Enter') {
        const main = document.querySelector('main');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Navigate between missions with arrow keys (when focused)
      if (e.target instanceof HTMLElement && e.target.closest('[data-mission]')) {
        const currentMission = e.target.closest('[data-mission]');
        if (!currentMission) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          const prev = currentMission.previousElementSibling as HTMLElement;
          if (prev?.focus) prev.focus();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          const next = currentMission.nextElementSibling as HTMLElement;
          if (next?.focus) next.focus();
        }
      }
    };

    // Announce page changes for screen readers
    const announcePageChange = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    };

    // Listen for mission changes and announce them
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach((node) => {
            if (node instanceof Element) {
              const missionTitle = node.querySelector('[data-mission-title]');
              if (missionTitle) {
                announcePageChange(`Navegando para: ${missionTitle.textContent}`);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', handleKeyboardNavigation);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, []);

  return null; // This component doesn't render anything
};
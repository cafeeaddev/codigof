import React from "react";
import { createPortal } from "react-dom";

const FixedBrandLogos: React.FC = () => {
  if (typeof document === 'undefined') return null;
  const content = (
    <aside
      aria-label="Logos institucionais"
      className="fixed left-3 sm:left-4 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] z-[60] pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-border/60 bg-background/60 backdrop-blur-sm px-3 py-2 shadow-sm">
        <img
          src="/lovable-uploads/94d6cc17-4c86-4276-8ad9-8406ccab7fd8.png"
          alt="Forvis Mazars"
          className="h-7 sm:h-9 w-auto opacity-90"
          loading="lazy"
          decoding="async"
        />
        <span className="h-5 sm:h-6 w-px bg-foreground/20" aria-hidden />
        <img
          src="/lovable-uploads/35f1196e-cbc7-43e5-a230-07f5020611f7.png"
          alt="Universidade Forvis Mazars"
          className="h-7 sm:h-9 w-auto opacity-90"
          loading="lazy"
          decoding="async"
        />
      </div>
    </aside>
  );
  return createPortal(content, document.body);
};

export default FixedBrandLogos;

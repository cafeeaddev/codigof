import { Building2, Code2 } from 'lucide-react';

export const SiteFooter = () => {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-8 p-3 bg-muted/50 rounded-t-lg">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground text-sm ml-2 font-mono">SISTEMA_INFO_v3.0</span>
          </div>

          {/* Main content */}
          <div className="text-center space-y-8">
            {/* Community section */}
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Building2 className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-secondary text-xl font-bold tracking-wider">
                TRANSFORMAÇÃO DIGITAL
              </h3>
              <p className="text-foreground text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                Faça parte da comunidade que impulsiona a transformação digital na 
                <span className="text-secondary font-bold ml-1">Forvis Mazars</span>
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent w-full max-w-md"></div>
            </div>

            {/* Developer section */}
            <div className="space-y-3">
              <div className="flex justify-center mb-3">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <p className="text-muted-foreground text-sm">
                Desenvolvido pela{' '}
                <span className="text-accent font-semibold">Café EAD</span>
                {' '}- Empresa do Grupo{' '}
                <span className="text-accent font-semibold">Café Educacional</span>
              </p>
            </div>

            {/* Technical info */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-muted-foreground text-xs font-mono tracking-wider">
                © 2024 • SISTEMA DIGITAL INTEGRADO • v2.0.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
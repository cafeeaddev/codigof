import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as ErrorBoundaryState;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Enhanced error logging for production debugging
    console.error("🚨 ErrorBoundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Track error for analytics (could be extended with error tracking service)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: true
      });
    }
    
    this.setState({ info });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null });
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 text-foreground p-6">
          <article className="max-w-2xl w-full rounded-md border border-border bg-background shadow-md p-6">
            <header className="mb-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-xl font-semibold text-destructive">Oops! Algo deu errado</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Um erro inesperado ocorreu. Nosso time foi notificado automaticamente.
              </p>
            </header>
            <section className="mb-4 text-sm">
              <pre className="whitespace-pre-wrap break-words text-destructive/90">
                {this.state.error?.message}
              </pre>
              {this.state.info?.componentStack && (
                <details className="mt-3 open:pt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">Stack de componentes</summary>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {this.state.info.componentStack}
                  </pre>
                </details>
              )}
            </section>
            <footer className="flex items-center justify-center gap-3">
              <button 
                onClick={this.handleReload} 
                className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                🔄 Recarregar Página
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                ← Voltar
              </button>
            </footer>
          </article>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;

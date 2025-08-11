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
    // Log for diagnostics
    console.error("ErrorBoundary caught an error:", error, info);
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
            <header className="mb-4">
              <h1 className="text-lg font-semibold">Ocorreu um erro na interface</h1>
              <p className="text-sm text-muted-foreground">Revise os detalhes abaixo ou recarregue a página.</p>
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
            <footer className="flex items-center justify-end gap-2">
              <button onClick={this.handleReload} className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors">
                Recarregar
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

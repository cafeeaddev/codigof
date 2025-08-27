import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  const logMetrics = useCallback((metrics: PerformanceMetrics) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [Performance] ${componentName}:`, {
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        timestamp: new Date().toISOString()
      });
    }

    // In production, you could send this to an analytics service
    if (process.env.NODE_ENV === 'production' && metrics.renderTime > 100) {
      // Log slow renders
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'performance_issue', {
          event_category: 'Performance',
          event_label: componentName,
          value: Math.round(metrics.renderTime)
        });
      }
    }
  }, [componentName]);

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    logMetrics({
      renderTime,
      memoryUsage,
      componentName
    });
  }, [logMetrics, startTime, componentName]);

  const measureAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      logMetrics({
        renderTime: duration,
        componentName: `${componentName}.${operationName}`
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ [Performance] ${componentName}.${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [componentName, logMetrics]);

  return { measureAsyncOperation };
};
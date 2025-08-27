// Production optimizations utility
export const productionOptimizations = {
  // Enable performance monitoring
  enablePerformanceMonitoring: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor long tasks
      if ('observe' in PerformanceObserver.prototype) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Tasks longer than 50ms
                console.warn('🐌 Long task detected:', {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                });
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          console.warn('PerformanceObserver not supported');
        }
      }

      // Monitor memory usage
      if ((performance as any).memory) {
        setInterval(() => {
          const memory = (performance as any).memory;
          const memoryUsage = {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          };
          
          // Warn if memory usage is high
          if (memoryUsage.used > 100) { // 100MB threshold
            console.warn('🧠 High memory usage:', memoryUsage);
          }
        }, 30000); // Check every 30 seconds
      }
    }
  },

  // Optimize images
  optimizeImages: () => {
    if (typeof window !== 'undefined') {
      // Add loading="lazy" to images that don't have it
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });

      // Add preload hints for critical images
      const criticalImages = document.querySelectorAll('img[data-critical]');
      criticalImages.forEach(img => {
        if (img instanceof HTMLImageElement) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = img.src;
          link.as = 'image';
          document.head.appendChild(link);
        }
      });
    }
  },

  // Add gesture support for mobile
  addGestureSupport: () => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      let startX = 0;
      let startY = 0;

      document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Swipe detection (minimum 50px distance)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            // Swipe right - go to previous mission/section
            document.dispatchEvent(new CustomEvent('swipeRight'));
          } else {
            // Swipe left - go to next mission/section
            document.dispatchEvent(new CustomEvent('swipeLeft'));
          }
        }
      }, { passive: true });
    }
  },

  // Enhanced error tracking
  setupErrorTracking: () => {
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });

      // Track in analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: event.message,
          fatal: false
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString()
      });

      // Track in analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: `Unhandled promise: ${event.reason}`,
          fatal: false
        });
      }
    });
  },

  // Initialize all optimizations
  init: () => {
    productionOptimizations.enablePerformanceMonitoring();
    productionOptimizations.optimizeImages();
    productionOptimizations.addGestureSupport();
    productionOptimizations.setupErrorTracking();
    
    console.log('✅ Production optimizations initialized');
  }
};
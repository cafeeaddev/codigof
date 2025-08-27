import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from './components/dev/ErrorBoundary';
import { productionOptimizations } from '@/utils/productionOptimizations';

console.info('[Main] Bootstrapping application...');

// Initialize production optimizations
if (process.env.NODE_ENV === 'production') {
  productionOptimizations.init();
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </AuthProvider>
);

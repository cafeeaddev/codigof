import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from './components/dev/ErrorBoundary';

console.info('[Main] Bootstrapping application...');

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </AuthProvider>
);

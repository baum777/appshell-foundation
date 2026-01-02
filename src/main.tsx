import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker Registration
async function registerServiceWorker(): Promise<void> {
  // In dev/test the file `/sw.js` may not be served with a valid JS MIME type.
  // Register only for production builds.
  if (!import.meta.env.PROD) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[App] Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[App] Service Worker registered:', registration.scope);

    // Listen for SW messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data;
      
      if (message.type === 'SW_STATUS') {
        console.log('[App] SW Status:', message.status);
        
        if (message.status === 'authRequired') {
          // BACKEND_TODO: Handle auth required - show login prompt
          console.warn('[App] SW requires authentication');
        }
      }
      
      if (message.type === 'NAVIGATE') {
        // Navigate to URL from notification click
        window.location.href = message.url;
      }
    });

    // Send tick to SW every 30 seconds while app is open
    setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SW_TICK' });
      }
    }, 30000);

    // Send initial tick
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SW_TICK' });
    }

  } catch (error) {
    console.error('[App] Service Worker registration failed:', error);
  }
}

// Register SW after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

createRoot(document.getElementById("root")!).render(<App />);

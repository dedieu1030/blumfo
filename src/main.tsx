
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Import i18n configuration
import { ClerkProvider } from '@clerk/clerk-react';

// Clé publishable de Clerk
const CLERK_PUBLISHABLE_KEY = "pk_test_Z2xhZC1tdWxsZXQtNDAuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Clé publishable Clerk manquante");
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          rootBox: "max-w-full",
          card: "shadow-none",
          formButtonPrimary: "bg-violet hover:bg-violet/90 text-white",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);

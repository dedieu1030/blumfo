
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Import i18n configuration
import { Toaster } from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
);

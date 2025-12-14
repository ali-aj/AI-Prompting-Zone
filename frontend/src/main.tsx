import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { VoiceChatProvider } from './context/VoiceChatContext';
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import posthog from 'posthog-js';
import VoiceChat from './components/VoiceChat';

// Initialize PostHog asynchronously for minimal performance impact
posthog.init(
  import.meta.env.VITE_POSTHOG_KEY,
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: true, // enables click tracking
    capture_pageview: true,
  }
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <VoiceChatProvider>
          <App />
          <VoiceChat />
        </VoiceChatProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
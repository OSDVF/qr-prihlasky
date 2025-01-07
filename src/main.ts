import { createApp } from 'vue'
import { VueFire } from 'vuefire'
import { initializeApp } from 'firebase/app'
import * as Sentry from "@sentry/vue"
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(VueFire, {
    firebaseApp: initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    })
})
.mount('#app')

Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
  
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  
    tracesSampleRate: .5,
    tracePropagationTargets: ["localhost", import.meta.env.VITE_SENTRY_TRACE_PROPAGATION],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
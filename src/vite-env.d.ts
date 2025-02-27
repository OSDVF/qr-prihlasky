/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIRESTORE_COLLECTION?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_TRACE_PROPAGATION?: string
  readonly VITE_PASSWORD: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
import { createApp } from 'vue'
import { VueFire } from 'vuefire'
import { initializeApp } from 'firebase/app'
import * as Sentry from "@sentry/vue"
import './style.css'
import App from './App.vue'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import cloud from './cloud'
import { detect } from 'detect-browser'

const browser = detect()

if (browser?.os == 'iOS' && browser?.name !== 'ios') {
    alert('Použijte Safari. V iOS a WebKit je přístup k fotoaparátu omezen.\nNebude možné skenovat QR kódy.')
}

let password = (browser?.os == 'iOS' || window.matchMedia('(display-mode: standalone)').matches) ? localStorage.getItem('password') : null 
while (password != import.meta.env.VITE_PASSWORD)
{
    password = prompt("Heslo")
    if (!password) {
        window.close()
    } else if (password != import.meta.env.VITE_PASSWORD) {
        alert("Špatné heslo")
    }
}


localStorage.setItem("password", password!)
const app = createApp(App)

Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,

    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],

    tracesSampleRate: .5,
    tracePropagationTargets: ["localhost", import.meta.env.VITE_SENTRY_TRACE_PROPAGATION ?? ''],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

const firebaseApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
})

initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
})

app.use(VueFire, {
    firebaseApp
})
    .use(cloud)
    .mount('#app')
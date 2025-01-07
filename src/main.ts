import { createApp } from 'vue'
import { VueFire } from 'vuefire'
import { initializeApp } from 'firebase/app'
import './style.css'
import App from './App.vue'

createApp(App)
.use(VueFire, {
    firebaseApp: initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    })
})
.mount('#app')

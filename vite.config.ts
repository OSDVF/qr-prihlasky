import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import childProcess from 'child_process'

const __commitMessageTime = JSON.stringify(childProcess.execSync('git log -1 --pretty="%B %cI"').toString().trim())
const __commitHash = `'${childProcess.execSync('git describe --tags --abbrev=1 --always').toString().trim()}'`
const __compileTime = `'${new Date().getTime().toString()}'`
const __compileTimeZone = `'${new Date().getTimezoneOffset().toString()}'`

// https://vite.dev/config/
export default defineConfig({
  define: {
    __commitMessageTime,
    __commitHash,
    __compileTime,
    __compileTimeZone
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: "QR Kontrolor Přihlášek",
        short_name: "QR Přihlášky",
        theme_color: "#242424",
        icons: [
          {
            src: '192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ],

  build: {
    sourcemap: true
  }
})
/**
 * plugins/index.ts
 *
 * Automatically loads and registers all Vuetify plugins
 */

// Types
import type { App } from 'vue'

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from './pinia'
import { router } from './router' // Impor router sebagai instance
import '@/plugins/iconify' // Impor untuk side effect (load CSS ikon)

export function registerPlugins(app: App) {
  loadFonts()
  app
    .use(vuetify)
    .use(pinia)
    .use(router) // Gunakan instance router
}

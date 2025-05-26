import { createApp } from 'vue'

import App from '@/App.vue'
import { registerPlugins } from '@/plugins'
import { supabase } from '@/plugins/supabase'
import { router } from '@/plugins/router' // Impor instance router

// Styles
import '@core/scss/template/index.scss'
import '@layouts/styles/index.scss'
import '@/assets/styles/styles.scss' // Added import for global styles

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Cek status otentikasi saat aplikasi dimuat
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, 'Session:', session)

  // beforeEach guard di router/index.ts akan menangani sebagian besar logika redirect awal.
  // onAuthStateChange lebih berguna untuk reaksi terhadap perubahan state SETELAH aplikasi berjalan.

  if (event === 'SIGNED_OUT') {
    // Jika pengguna logout dari tab lain atau sesi berakhir, paksa ke login.
    router.push('/login')
  } else if (event === 'SIGNED_IN') {
    // Jika pengguna sign in (misalnya via magic link di tab lain)
    // dan saat ini berada di halaman yang hanya untuk tamu, arahkan ke dashboard.
    if (router.currentRoute.value.meta.guestOnly) {
      router.push('/dashboard')
    }
  }
})

// Mount vue app
app.mount('#app')

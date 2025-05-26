import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { AuthError, User } from '@supabase/supabase-js'

// Definisikan tipe untuk state dan error
interface AuthState {
  user: User | null
  error: AuthError | null
  loading: boolean
}

// State reaktif untuk menyimpan status otentikasi
const authState = ref<AuthState>({
  user: null,
  error: null,
  loading: false,
})

// Fungsi untuk login
async function signIn(email: string, password: string): Promise<void> {
  authState.value.loading = true
  authState.value.error = null
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    authState.value.user = data.user
  } catch (err) {
    authState.value.error = err as AuthError
  } finally {
    authState.value.loading = false
  }
}

// Fungsi untuk register
async function signUp(email: string, password: string): Promise<void> {
  authState.value.loading = true
  authState.value.error = null
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    // Anda mungkin ingin mengirim email konfirmasi atau menangani sesi di sini
    authState.value.user = data.user 
  } catch (err) {
    authState.value.error = err as AuthError
  } finally {
    authState.value.loading = false
  }
}

// Fungsi untuk logout
async function signOut(): Promise<void> {
  authState.value.loading = true
  authState.value.error = null
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    authState.value.user = null
  } catch (err) {
    authState.value.error = err as AuthError
  } finally {
    authState.value.loading = false
  }
}

// Fungsi untuk mendapatkan sesi pengguna saat ini (jika diperlukan secara manual)
async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  authState.value.user = session?.user ?? null
  return authState.value.user
}

// Inisialisasi state pengguna saat service dimuat
getCurrentUser()

// Ekspor fungsi dan state yang diperlukan
export function useAuthService() {
  return {
    authState,
    signIn,
    signUp,
    signOut,
    getCurrentUser,
  }
}

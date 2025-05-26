import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, CreateUserPayload, UpdateUserPayload } from '../types'

export const useUserService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUsers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      return data as User[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createUser = async (payload: CreateUserPayload) => {
    try {
      loading.value = true
      error.value = null

      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
      })

      if (authError) throw authError

      // Then create user record
      const { data, error: err } = await supabase
        .from('users')
        .insert([
          {
            email: payload.email,
            name: payload.name,
            role: payload.role || 'staff',
            position: payload.position,
            phone_number: payload.phone_number,
            auth_uid: authData.user?.id,
          },
        ])
        .select()
        .single()

      if (err) throw err

      return data as User
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, payload: UpdateUserPayload) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      return data as User
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // Get auth_uid first
      const { data: userData } = await supabase
        .from('users')
        .select('auth_uid')
        .eq('id', id)
        .single()

      if (userData?.auth_uid) {
        // Delete auth user first
        const { error: authError } = await supabase.auth.admin.deleteUser(
          userData.auth_uid
        )
        if (authError) throw authError
      }

      // Then delete user record
      const { error: err } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (err) throw err

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

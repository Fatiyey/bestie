import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Member } from '../types'

export const useMemberService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getMembers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      return data as Member[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getMemberById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_users')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err

      return data as Member
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const getMembersByIds = async (ids: string[]) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_users')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false })

      if (err) throw err

      return data as Member[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getMembers,
    getMemberById,
    getMembersByIds,
  }
}

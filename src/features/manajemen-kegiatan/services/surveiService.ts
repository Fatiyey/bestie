import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Survei, CreateSurveiPayload, UpdateSurveiPayload } from '../types/survei'

export const useSurveiService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSurveis = async () => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_survei')
        .select(`
          *,
          tipe_periode:srv_tipe_periode!tipe_periode_id (
            id,
            nama_tipe
          )
        `)
        .order('id', { ascending: false })
      if (err) throw err
      return data as Survei[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createSurvei = async (payload: CreateSurveiPayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_survei')
        .insert([payload])
        .select()
      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const updateSurvei = async (id: number, payload: UpdateSurveiPayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_survei')
        .update(payload)
        .eq('id', id)
        .select()
      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteSurvei = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase
        .from('srv_survei')
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
    getSurveis,
    createSurvei,
    updateSurvei,
    deleteSurvei,
  }
}

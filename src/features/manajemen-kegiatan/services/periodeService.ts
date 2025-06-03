import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Periode, CreatePeriodePayload, UpdatePeriodePayload } from '../types/periode'

export const usePeriodeService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getPeriodes = async () => {
    try {        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
          .from('srv_periode')
        .select(`
          *,
          tipe_periode:srv_tipe_periode (
            id,
            nama_tipe
          )
        `)
        .order('id', { ascending: false })
      if (err) throw err
      return data as Periode[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createPeriode = async (payload: CreatePeriodePayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_periode')
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

  const updatePeriode = async (id: number, payload: UpdatePeriodePayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_periode')
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

  const deletePeriode = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase
        .from('srv_periode')
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
    getPeriodes,
    createPeriode,
    updatePeriode,
    deletePeriode,
  }
}

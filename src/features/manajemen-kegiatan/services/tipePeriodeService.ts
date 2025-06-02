import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { TipePeriode, CreateTipePeriodePayload, UpdateTipePeriodePayload } from '../types/tipePeriode'

export const useTipePeriodeService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTipePeriodes = async () => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_tipe_periode')
        .select('*')
        .order('id', { ascending: true })
      if (err) throw err
      return data as TipePeriode[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createTipePeriode = async (payload: CreateTipePeriodePayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_tipe_periode')
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

  const updateTipePeriode = async (id: number, payload: UpdateTipePeriodePayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_tipe_periode')
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

  const deleteTipePeriode = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase
        .from('srv_tipe_periode')
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
    getTipePeriodes,
    createTipePeriode,
    updateTipePeriode,
    deleteTipePeriode,
  }
}

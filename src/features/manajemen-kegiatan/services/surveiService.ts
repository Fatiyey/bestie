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
          tipe_periode_data:srv_tipe_periode!tipe_periode (
            id,
            nama_tipe
          ),
          parent:srv_survei!parent_survei_id (
            id,
            nama
          ),
          children:srv_survei!parent_survei_id (
            id,
            nama,
            tipe_periode,
            is_parent,
            parent_survei_id
          )
        `)
        .order('is_parent', { ascending: false })
        .order('parent_survei_id', { ascending: true, nullsFirst: true })
        .order('id', { ascending: true })
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
      
      // Pastikan payload sesuai dengan struktur hierarchy
      const insertPayload = {
        nama: payload.nama,
        tipe_periode: payload.tipe_periode,
        is_parent: payload.is_parent ?? true,
        parent_survei_id: payload.parent_survei_id ?? null
      }
      
      const { data, error: err } = await supabase
        .from('srv_survei')
        .insert([insertPayload])
        .select(`
          *,
          tipe_periode_data:srv_tipe_periode!tipe_periode (
            id,
            nama_tipe
          ),
          parent:srv_survei!parent_survei_id (
            id,
            nama
          )
        `)
      
      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating survei:', err)
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
        .select(`
          *,
          tipe_periode_data:srv_tipe_periode!tipe_periode (
            id,
            nama_tipe
          ),
          parent:srv_survei!parent_survei_id (
            id,
            nama
          )
        `)
      
      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating survei:', err)
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
      console.error('Error deleting survei:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Fungsi khusus untuk mendapatkan survei parent saja
  const getParentSurveis = async () => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_survei')
        .select(`
          *,
          tipe_periode_data:srv_tipe_periode!tipe_periode (
            id,
            nama_tipe
          )
        `)
        .eq('is_parent', true)
        .order('nama', { ascending: true })
      if (err) throw err
      return data as Survei[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Fungsi untuk mendapatkan survei untuk dropdown honor
  const getSurveisForSelection = async () => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_survei')
        .select(`
          id,
          nama,
          is_parent,
          parent_survei_id,
          parent:srv_survei!parent_survei_id (
            nama
          )
        `)
        .or('is_parent.eq.false,and(is_parent.eq.true,id.not.in.(select parent_survei_id from srv_survei where parent_survei_id is not null))')
        .order('is_parent', { ascending: false })
        .order('nama', { ascending: true })
      
      if (err) throw err
      
      // Transform data untuk dropdown
      const result = data?.map(item => ({
        id: item.id,
        nama: item.nama,
        display_name: item.is_parent 
          ? item.nama 
          : `${item.parent?.[0]?.nama || 'Unknown'} - ${item.nama}`,
        is_parent: item.is_parent,
        parent_nama: item.parent?.[0]?.nama
      })) || []
      
      return result
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
    getSurveis,
    createSurvei,
    updateSurvei,
    deleteSurvei,
    getParentSurveis,
    getSurveisForSelection,
  }
}

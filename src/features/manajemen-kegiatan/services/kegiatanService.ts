import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Kegiatan, CreateKegiatanPayload, UpdateKegiatanPayload, SurveiRinci } from '../types/kegiatan'

export const useKegiatanService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getKegiatans = async (): Promise<Kegiatan[]> => {
    try {
      loading.value = true
      error.value = null
      
      // Get data from srv_survei_rinci first
      const { data, error: err } = await supabase
        .from('srv_survei_rinci')
        .select(`
          *,
          survei:srv_survei (
            *,
            tipe_periode_data:srv_tipe_periode (
              *
            )
          ),
          kegiatan:srv_kegiatan (*)
        `)
        .order('nama_kegiatan')

      if (err) {
        console.error('Supabase error:', err)
        throw err
      }

      console.log('Raw data:', data)      // Filter and transform data
      const transformedData = (data || [])
        .filter((item: any) => item.kegiatan && item.kegiatan.is_active !== false)
        .map((item: any) => ({
          id: item.kegiatan.id,
          jabatan: item.kegiatan.jabatan,
          jenis_pekerjaan: item.kegiatan.jenis_pekerjaan,
          satuan: item.kegiatan.satuan,
          honor: Number(item.kegiatan.honor) || 0,
          is_active: item.kegiatan.is_active !== false,
          survei_rinci: {
            id: item.id,
            nama_kegiatan: item.nama_kegiatan,
            survei_id: item.survei_id,
            survei: item.survei
          }
        })) as Kegiatan[]

      console.log('Transformed data:', transformedData)
      return transformedData
    } catch (err: any) {
      error.value = err.message
      console.error('Error in getKegiatans:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const createKegiatan = async (payload: CreateKegiatanPayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_kegiatan')
        .insert([{
          jabatan: payload.jabatan,
          jenis_pekerjaan: payload.jenis_pekerjaan,
          satuan: payload.satuan,
          honor: payload.honor,
          is_active: true,
          survei_rinci_id: payload.survei_rinci_id
        }])
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

  const updateKegiatan = async (id: number, payload: UpdateKegiatanPayload) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase
        .from('srv_kegiatan')
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

  const deleteKegiatan = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase
        .from('srv_kegiatan')
        .update({ is_active: false })
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
    getKegiatans,
    createKegiatan,
    updateKegiatan,
    deleteKegiatan
  }
}

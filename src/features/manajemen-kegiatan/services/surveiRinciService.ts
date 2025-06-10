import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { SurveiRinci } from '../types/kegiatan'

export const useSurveiRinciService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSurveiRincis = async (): Promise<SurveiRinci[]> => {
    try {      loading.value = true;
      error.value = null;
        const { data, error: err } = await supabase
        .from('srv_survei_rinci')
        .select(`
          id,
          nama_kegiatan,
          survei_id,
          survei:srv_survei(
            id,
            nama,
            tipe_periode,
            tipe_periode_data:srv_tipe_periode(*)
          ),          kegiatan:srv_kegiatan(
            id,
            jabatan,
            jenis_pekerjaan,
            satuan,
            honor
          )
        `)
        .order('nama_kegiatan');

      if (err) {
        console.error('Supabase error:', err)
        throw err
      }

      // Transform the data to match our interface
      const transformedData: SurveiRinci[] = (data || []).map((item: any) => ({
        id: item.id,
        nama_kegiatan: item.nama_kegiatan,
        survei_id: item.survei_id,
        survei: item.survei ? {
          id: item.survei.id,
          nama: item.survei.nama,
          periode_id: item.survei.periode_id || null,
          tipe_periode: item.survei.tipe_periode,
          tipe_periode_data: item.survei.tipe_periode_data,
          is_parent: !!item.survei.is_parent,
          parent_survei_id: item.survei.parent_survei_id || null
        } : undefined,        kegiatan: item.kegiatan ? {
          id: item.kegiatan.id,
          jabatan: item.kegiatan.jabatan,
          jenis_pekerjaan: item.kegiatan.jenis_pekerjaan,
          satuan: item.kegiatan.satuan,
          honor: Number(item.kegiatan.honor) || 0,
          is_active: true  // Since the column doesn't exist, we'll default to true
        } : undefined
      }))

      console.log('Transformed SurveiRinci data:', transformedData)
      return transformedData
    } catch (err: any) {
      console.error('Error in getSurveiRincis:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getSurveiRincis
  }
}

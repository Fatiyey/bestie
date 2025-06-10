import { supabase } from '@/plugins/supabase'

export async function checkTables() {
  console.log('Checking tables...')

  try {
    // Check srv_survei
    const { data: surveiData, error: surveiError } = await supabase
      .from('srv_survei')
      .select('*')
    
    if (surveiError) {
      console.error('Error fetching srv_survei:', surveiError)
    } else {
      console.log('srv_survei data:', surveiData)
    }

    // Check srv_survei_rinci
    const { data: rinciData, error: rinciError } = await supabase
      .from('srv_survei_rinci')
      .select('*')
    
    if (rinciError) {
      console.error('Error fetching srv_survei_rinci:', rinciError)
    } else {
      console.log('srv_survei_rinci data:', rinciData)
    }

    // Check srv_tipe_periode
    const { data: periodeData, error: periodeError } = await supabase
      .from('srv_tipe_periode')
      .select('*')
    
    if (periodeError) {
      console.error('Error fetching srv_tipe_periode:', periodeError)
    } else {
      console.log('srv_tipe_periode data:', periodeData)
    }

    // Check srv_kegiatan
    const { data: kegiatanData, error: kegiatanError } = await supabase
      .from('srv_kegiatan')
      .select('*')
    
    if (kegiatanError) {
      console.error('Error fetching srv_kegiatan:', kegiatanError)
    } else {
      console.log('srv_kegiatan data:', kegiatanData)
    }

  } catch (error) {
    console.error('Error in checkTables:', error)
  }
}

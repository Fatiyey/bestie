<![CDATA[<template>
  <v-card>
    <v-card-title>Debug Data</v-card-title>
    <v-card-text>
      <div v-if="loading" class="d-flex align-center justify-center">
        <v-progress-circular indeterminate />
      </div>
      
      <div v-else>
        <h3>SRV_KEGIATAN Data:</h3>
        <pre>{{ kegiatanData }}</pre>

        <h3>SRV_SURVEI_RINCI Data:</h3>
        <pre>{{ surveiRinciData }}</pre>

        <h3>SRV_SURVEI Data:</h3>
        <pre>{{ surveiData }}</pre>

        <h3>SRV_TIPE_PERIODE Data:</h3>
        <pre>{{ tipePeriodeData }}</pre>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/plugins/supabase'

const loading = ref(true)
const kegiatanData = ref(null)
const surveiRinciData = ref(null)
const surveiData = ref(null) 
const tipePeriodeData = ref(null)

const checkTables = async () => {
  try {
    // Check srv_kegiatan
    console.log('Checking srv_kegiatan table...')
    const { data: kData, error: kError } = await supabase
      .from('srv_kegiatan')
      .select('*')
    
    if (kError) {
      console.error('Error fetching srv_kegiatan:', kError)
    } else {
      console.log('srv_kegiatan data:', kData)
      kegiatanData.value = kData
    }

    // Check srv_survei_rinci
    console.log('Checking srv_survei_rinci table...')
    const { data: rData, error: rError } = await supabase
      .from('srv_survei_rinci')
      .select('*')
    
    if (rError) {
      console.error('Error fetching srv_survei_rinci:', rError)
    } else {
      console.log('srv_survei_rinci data:', rData)
      surveiRinciData.value = rData
    }

    // Check srv_survei
    console.log('Checking srv_survei table...')
    const { data: sData, error: sError } = await supabase
      .from('srv_survei')
      .select('*')
    
    if (sError) {
      console.error('Error fetching srv_survei:', sError)
    } else {
      console.log('srv_survei data:', sData)
      surveiData.value = sData
    }

    // Check srv_tipe_periode
    console.log('Checking srv_tipe_periode table...')
    const { data: tData, error: tError } = await supabase
      .from('srv_tipe_periode')
      .select('*')
    
    if (tError) {
      console.error('Error fetching srv_tipe_periode:', tError)
    } else {
      console.log('srv_tipe_periode data:', tData)
      tipePeriodeData.value = tData
    }

  } catch (error) {
    console.error('Error in checkTables:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkTables()
})
</script>]]>

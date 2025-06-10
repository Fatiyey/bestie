<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between pa-6">
      <span>Debug Kegiatan</span>
      <v-btn
        color="primary"
        prepend-icon="ri-refresh-line"
        @click="checkTables"
      >
        Refresh Data
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>srv_survei</v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre>{{ surveiData }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>srv_survei_rinci</v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre>{{ surveiRinciData }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>srv_tipe_periode</v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre>{{ tipePeriodeData }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>srv_kegiatan</v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre>{{ kegiatanData }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/plugins/supabase'

const surveiData = ref<any[]>([])
const surveiRinciData = ref<any[]>([])
const tipePeriodeData = ref<any[]>([])
const kegiatanData = ref<any[]>([])

const checkTables = async () => {
  // Check srv_survei
  const { data: sData, error: sError } = await supabase
    .from('srv_survei')
    .select('*')
  
  if (!sError) surveiData.value = sData

  // Check srv_survei_rinci
  const { data: srData, error: srError } = await supabase
    .from('srv_survei_rinci')
    .select('*')
  
  if (!srError) surveiRinciData.value = srData

  // Check srv_tipe_periode
  const { data: tpData, error: tpError } = await supabase
    .from('srv_tipe_periode')
    .select('*')
  
  if (!tpError) tipePeriodeData.value = tpData

  // Check srv_kegiatan
  const { data: kData, error: kError } = await supabase
    .from('srv_kegiatan')
    .select('*')
  
  if (!kError) kegiatanData.value = kData
}

onMounted(checkTables)
</script>

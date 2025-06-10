<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between pa-6">
      <span>Manajemen Kegiatan</span>
      <v-btn
        color="primary"
        prepend-icon="ri-add-line"
        @click="openCreateDialog"
      >
        Tambah Kegiatan
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Search Bar -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="ri-search-line"
        label="Cari kegiatan..."
        single-line
        hide-details
        variant="outlined"
        density="compact"
        class="mb-4"
        clearable
      />

      <!-- Summary Statistics -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text>
              <div class="text-subtitle-2 text-medium-emphasis mb-1">Total Kegiatan</div>
              <div class="text-h5">{{ kegiatanList.length }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text>
              <div class="text-subtitle-2 text-medium-emphasis mb-1">Total Honor</div>
              <div class="text-h5">{{ totalHonor }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="kegiatanList"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #loading>
          <v-skeleton-loader
            type="table-row"
            :loading="true"
            :types="{
              'table-row': 'table-row-divider, table-row-divider, table-row-divider'
            }"
          ></v-skeleton-loader>
        </template>        <!-- No data and no results template -->
        <template #no-data>
          <div class="d-flex align-center justify-center pa-4">
            <template v-if="search">
              <v-icon icon="ri-search-line" size="large" class="me-2" />
              <span>Tidak ada hasil yang cocok dengan pencarian</span>
            </template>
            <template v-else>
              <v-icon icon="ri-inbox-line" size="large" class="me-2" />
              <span>Tidak ada data kegiatan</span>
            </template>
          </div>
        </template>        <!-- Survey Column -->
        <template #item.survei.nama="{ item }">
          <div class="d-flex align-center">
            <v-chip
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ item.survei?.nama || '-' }}
            </v-chip>
          </div>
        </template>

        <!-- Activity Column -->
        <template #item.nama_kegiatan="{ item }">
          <div>{{ item.nama_kegiatan || '-' }}</div>
        </template>

        <!-- Period Type Column -->
        <template #item.survei.tipe_periode_data.nama_tipe="{ item }">
          <v-chip
            size="small"
            :color="item.survei?.tipe_periode_data?.nama_tipe ? 'success' : 'grey'"
            variant="tonal"
          >
            {{ item.survei?.tipe_periode_data?.nama_tipe || 'Tidak Ada' }}
          </v-chip>
        </template>        <!-- Honor Column -->        <template #item.kegiatan.honor="{ item }">
          <div class="text-end">
            <span :class="{ 'font-weight-bold': true, 'text-success': (item.kegiatan?.honor ?? 0) > 0 }">
              {{ formatCurrency(item.kegiatan?.honor ?? 0) }}
            </span>
          </div>
        </template>

        <template #item.kegiatan.jabatan="{ item }">
          <div>{{ item.kegiatan?.jabatan || '-' }}</div>
        </template>

        <template #item.kegiatan.jenis_pekerjaan="{ item }">
          <div>{{ item.kegiatan?.jenis_pekerjaan || '-' }}</div>
        </template>

        <template #item.kegiatan.satuan="{ item }">
          <div>{{ item.kegiatan?.satuan || '-' }}</div>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-btn
              icon="ri-edit-line"
              size="small"
              color="info"
              variant="text"
              @click="openEditDialog(item)"
              :disabled="!item.kegiatan"
            >
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            <v-btn
              icon="ri-delete-bin-line"
              size="small"
              color="error"
              variant="text"
              @click="openDeleteDialog(item)"
              :disabled="!item.kegiatan"
            >
              <v-tooltip activator="parent" location="top">Hapus</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          {{ isCreating ? 'Tambah Kegiatan' : 'Edit Kegiatan' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="handleSubmit" v-model="formValid">
            <!-- Form Fields -->
            <v-select
              v-model="editedItem.survei_rinci"
              :items="surveiRinciList"
              item-title="nama_kegiatan"
              item-value="id"
              label="Nama Kegiatan"
              :rules="[v => !!v || 'Nama kegiatan harus diisi']"
              required
              class="mb-4"
              return-object
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #title>
                    {{ item?.raw?.nama_kegiatan }}
                  </template>
                  <template #subtitle>
                    Survei: {{ item?.raw?.survei?.nama }} |
                    Tipe: {{ item?.raw?.survei?.tipe_periode_data?.nama_tipe }}
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-text-field
              v-model="editedItem.jabatan"
              label="Jabatan"
              :rules="[
                v => !!v || 'Jabatan harus diisi',
                v => (v && v.length <= 100) || 'Jabatan tidak boleh lebih dari 100 karakter'
              ]"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="editedItem.jenis_pekerjaan"
              label="Jenis Pekerjaan"
              :rules="[
                v => !!v || 'Jenis pekerjaan harus diisi',
                v => (v && v.length <= 200) || 'Jenis pekerjaan tidak boleh lebih dari 200 karakter'
              ]"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="editedItem.satuan"
              label="Satuan"
              :rules="[
                v => !!v || 'Satuan harus diisi',
                v => (v && v.length <= 50) || 'Satuan tidak boleh lebih dari 50 karakter'
              ]"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="editedItem.honor"
              label="Honor"
              type="number"
              :rules="[
                v => !!v || 'Honor harus diisi',
                v => (v && v >= 0) || 'Honor tidak boleh negatif',
                v => (v && v <= 999999999) || 'Honor terlalu besar'
              ]"
              required
              prefix="Rp"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="editDialog = false"
          >
            Batal
          </v-btn>
          <v-btn 
            color="primary"
            @click="handleSubmit"
            :loading="loading"
            :disabled="!formValid"
          >
            {{ isCreating ? 'Simpan' : 'Update' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-6">Konfirmasi Hapus</v-card-title>
        <v-card-text class="pa-6">
          Apakah Anda yakin ingin menghapus kegiatan ini?
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>
          <v-btn 
            color="error"
            @click="handleDelete"
            :loading="loading"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="snackbarTimeout"
      :location="snackbarLocation"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="hideSnackbar">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useKegiatanService } from '../services/kegiatanService'
import type { Kegiatan, CreateKegiatanPayload, SurveiRinci } from '../types/kegiatan'
import { useSurveiRinciService } from '../services/surveiRinciService'
import { useNotification } from '@/composables/useNotification'

const { getKegiatans, createKegiatan, updateKegiatan, deleteKegiatan, loading } = useKegiatanService()
const { getSurveiRincis } = useSurveiRinciService()
const { 
  snackbar,
  snackbarMessage,
  snackbarColor,
  snackbarTimeout,
  snackbarLocation,
  showSnackbar,
  hideSnackbar
} = useNotification()

// Methods to show success/error messages
const showSuccess = (message: string) => showSnackbar(message, 'success')
const showError = (message: string) => showSnackbar(message, 'error')

// Data
const search = ref('')
const kegiatanList = ref<SurveiRinci[]>([])
const surveiRinciList = ref<SurveiRinci[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(true)
const selectedId = ref<number | null>(null)
const formValid = ref(false)

// Form
const formRef = ref()

// Computed
const totalHonor = computed(() => {
  return formatCurrency(
    kegiatanList.value.reduce((sum, item) => 
      sum + (item.kegiatan?.honor || 0), 0
    )
  )
})

interface EditedItem {
  survei_rinci: SurveiRinci | null
  jabatan: string
  jenis_pekerjaan: string
  satuan: string
  honor: number
}

const editedItem = reactive<EditedItem>({
  survei_rinci: null,
  jabatan: '',
  jenis_pekerjaan: '',
  satuan: '',
  honor: 0
})

// Table Headers
const headers = [
  { 
    title: 'Survei',
    key: 'survei.nama',
    align: 'start' as const,
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Nama Kegiatan', 
    key: 'nama_kegiatan',
    align: 'start' as const,
    sortable: true,
    width: '200px'
  },
  { 
    title: 'Tipe Periode',
    key: 'survei.tipe_periode_data.nama_tipe',
    align: 'start' as const,
    sortable: true,
    width: '150px'
  },  { 
    title: 'Jabatan', 
    key: 'kegiatan.jabatan',
    align: 'start' as const,
    sortable: true,
    width: '150px'
  },
  { 
    title: 'Jenis Pekerjaan', 
    key: 'kegiatan.jenis_pekerjaan',
    align: 'start' as const,
    sortable: true
  },
  { 
    title: 'Satuan', 
    key: 'kegiatan.satuan',
    align: 'start' as const,
    sortable: true,
    width: '100px'
  },
  { 
    title: 'Honor', 
    key: 'kegiatan.honor',
    align: 'end' as const,
    sortable: true,
    width: '150px'
  },
  { 
    title: 'Aksi', 
    key: 'actions',
    align: 'center' as const,
    sortable: false,
    width: '100px'
  }
]

// Methods
const fetchData = async () => {
  try {
    const surveiRinci = await getSurveiRincis();
    kegiatanList.value = surveiRinci;
    surveiRinciList.value = surveiRinci;
  } catch (error) {
    showError('Terjadi kesalahan saat mengambil data')
    console.error('Error in fetchData:', error)
  }
}

const getCreatePayload = (): CreateKegiatanPayload => {
  if (!editedItem.survei_rinci) throw new Error('Kegiatan harus dipilih')
  return {
    survei_rinci_id: editedItem.survei_rinci.id,
    jabatan: editedItem.jabatan,
    jenis_pekerjaan: editedItem.jenis_pekerjaan,
    satuan: editedItem.satuan,
    honor: editedItem.honor,
    is_active: true
  }
}

const resetForm = () => {
  editedItem.survei_rinci = null
  editedItem.jabatan = ''
  editedItem.jenis_pekerjaan = ''
  editedItem.satuan = ''
  editedItem.honor = 0
  selectedId.value = null
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const openCreateDialog = () => {
  resetForm()
  isCreating.value = true
  editDialog.value = true
}

const openEditDialog = (item: SurveiRinci) => {
  if (!item.kegiatan) return
  
  isCreating.value = false
  selectedId.value = item.kegiatan.id || null
  
  Object.assign(editedItem, {
    survei_rinci: item,
    jabatan: item.kegiatan.jabatan,
    jenis_pekerjaan: item.kegiatan.jenis_pekerjaan,
    satuan: item.kegiatan.satuan,
    honor: item.kegiatan.honor
  })
  
  editDialog.value = true
}

const openDeleteDialog = (item: SurveiRinci) => {
  if (item.kegiatan?.id) {
    selectedId.value = item.kegiatan.id
    deleteDialog.value = true
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  
  if (!valid) {
    showError('Mohon lengkapi semua field yang diperlukan')
    return
  }

  try {
    const payload = getCreatePayload()
    if (isCreating.value) {
      await createKegiatan(payload)
      showSuccess('Kegiatan berhasil ditambahkan')
    } else if (selectedId.value) {
      const { survei_rinci_id, is_active, ...updatePayload } = payload
      await updateKegiatan(selectedId.value, updatePayload)
      showSuccess('Kegiatan berhasil diperbarui')
    }
    
    editDialog.value = false
    resetForm()
    await fetchData()
  } catch (error) {
    if (error instanceof Error) {
      showError(error.message)
    } else {
      showError('Terjadi kesalahan saat menyimpan kegiatan')
    }
    console.error('Error in handleSubmit:', error)
  }
}

const handleDelete = async () => {
  if (selectedId.value) {
    try {
      await deleteKegiatan(selectedId.value)
      showSuccess('Kegiatan berhasil dihapus')
      deleteDialog.value = false
      resetForm()
      await fetchData()
    } catch (error) {
      showError('Terjadi kesalahan saat menghapus kegiatan')
      console.error('Error in handleDelete:', error)
    }
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// Lifecycle
onMounted(fetchData)
</script>

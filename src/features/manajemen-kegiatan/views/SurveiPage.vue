<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Manajemen Survei</span>
        <v-btn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreateDialog"
        >
          Tambah Survei
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <!-- Search Bar -->
        <div class="d-flex mb-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="ri-search-line"
            label="Cari survei..."
            variant="outlined"
            density="compact"
            clearable
            class="me-4"
            style="max-width: 300px;"
          />
        </div>

        <v-data-table
          :headers="headers"
          :items="filteredSurveiItems"
          :loading="loading"
          item-value="id"
          class="elevation-1"
        >
          <!-- Nama survei dengan hierarchy visual -->
          <template #item.nama="{ item }">
            <div class="d-flex align-center">
              <!-- Indentasi untuk child -->
              <div v-if="!item.is_parent && item.parent_survei_id" class="me-2" style="width: 24px;">
                <v-icon
                  icon="ri-corner-down-right-line"
                  size="16"
                  class="text-medium-emphasis"
                />
              </div>
              
              <!-- Icon berdasarkan tipe survei -->
              <!-- Parent dengan children -->
              <v-icon
                v-if="item.is_parent && item.children && item.children.length > 0"
                icon="ri-folder-open-line"
                size="20"
                class="text-primary me-2"
              />
              <!-- Parent tanpa children (standalone parent) -->
              <v-icon
                v-else-if="item.is_parent && (!item.children || item.children.length === 0)"
                icon="ri-file-list-3-line"
                size="20"
                class="text-warning me-2"
              />
              <!-- Child survei -->
              <v-icon
                v-else-if="!item.is_parent && item.parent_survei_id"
                icon="ri-file-text-line"
                size="18"
                class="text-info me-2"
              />
              <!-- Standalone survei (bukan parent, bukan child) -->
              <v-icon
                v-else
                icon="ri-file-list-line"
                size="18"
                class="text-success me-2"
              />
              
              <!-- Nama survei dengan style berbeda -->
              <span 
                :class="{
                  'font-weight-bold text-primary': item.is_parent && item.children && item.children.length > 0,
                  'font-weight-medium text-warning': item.is_parent && (!item.children || item.children.length === 0),
                  'font-weight-medium text-medium-emphasis': !item.is_parent && item.parent_survei_id,
                  'font-weight-medium': !item.is_parent && !item.parent_survei_id
                }"
              >
                {{ item.nama }}
              </span>
              
              <!-- Badge untuk parent dengan children -->
              <v-chip
                v-if="item.is_parent && item.children && item.children.length > 0"
                size="x-small"
                color="primary"
                variant="outlined"
                class="ms-2"
              >
                {{ item.children.length }} detail
              </v-chip>
              
              <!-- Badge untuk parent standalone -->
              <v-chip
                v-else-if="item.is_parent && (!item.children || item.children.length === 0)"
                size="x-small"
                color="warning"
                variant="outlined"
                class="ms-2"
              >
                Utama
              </v-chip>
              
              <!-- Badge untuk standalone -->
              <v-chip
                v-else-if="!item.is_parent && !item.parent_survei_id"
                size="x-small"
                color="success"
                variant="outlined"
                class="ms-2"
              >
                Mandiri
              </v-chip>
            </div>
          </template>

          <!-- Tipe periode -->
          <template #item.tipe_periode_data="{ item }">
            <v-chip
              v-if="item.tipe_periode_data"
              size="small"
              color="success"
              variant="tonal"
            >
              {{ item.tipe_periode_data.nama_tipe }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <!-- Add Detail untuk parent survei -->
              <v-btn
                v-if="item.is_parent"
                icon="ri-add-line"
                size="x-small"
                color="success"
                variant="tonal"
                @click="openCreateChildDialog(item)"
              >
                <v-tooltip activator="parent" location="top">
                  Tambah Detail
                </v-tooltip>
              </v-btn>

              <!-- Edit -->
              <v-btn
                icon="ri-edit-line"
                size="x-small"
                color="info"
                variant="tonal"
                @click="openEditDialog(item)"
              >
                <v-tooltip activator="parent" location="top">
                  Edit
                </v-tooltip>
              </v-btn>

              <!-- Delete -->
              <v-btn
                icon="ri-delete-bin-line"
                size="x-small"
                color="error"
                variant="tonal"
                @click="confirmDelete(item)"
              >
                <v-tooltip activator="parent" location="top">
                  Hapus
                </v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Create/Edit Survei -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ isEdit ? 'Edit Survei' : (isCreateChild ? 'Tambah Detail Survei' : 'Tambah Survei') }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submitForm">
            <v-row>
              <!-- Parent info untuk child survei -->
              <v-col v-if="isCreateChild && selectedParent" cols="12">
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <template #title>Detail Survei untuk:</template>
                  <strong>{{ selectedParent.nama }}</strong>
                </v-alert>
              </v-col>

              <!-- Nama Survei -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.nama"
                  label="Nama Survei"
                  :rules="[v => !!v || 'Nama survei harus diisi']"
                  required
                />
              </v-col>

              <!-- Tipe Periode (hanya untuk parent atau edit) -->
              <v-col v-if="!isCreateChild" cols="12">
                <v-select
                  v-model="formData.tipe_periode"
                  :items="tipePeriodsOptions"
                  item-title="nama_tipe"
                  item-value="id"
                  label="Tipe Periode"
                  :rules="[v => !!v || 'Tipe periode harus dipilih']"
                  required
                />
              </v-col>

              <!-- Parent Survei (hanya untuk survei baru, bukan child) -->
              <v-col v-if="!isEdit && !isCreateChild" cols="12">
                <v-select
                  v-model="formData.parent_survei_id"
                  :items="parentOptions"
                  item-title="nama"
                  item-value="id"
                  label="Parent Survei (Opsional)"
                  clearable
                  hint="Pilih parent jika ini adalah detail survei"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeDialog"
          >
            Batal
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            @click="submitForm"
          >
            {{ isEdit ? 'Update' : 'Simpan' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Konfirmasi Delete -->
    <v-dialog
      v-model="deleteDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Konfirmasi Hapus
        </v-card-title>
        
        <v-card-text>
          <v-alert
            v-if="itemToDelete && itemToDelete.is_parent && itemToDelete.children && itemToDelete.children.length > 0"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #title>Peringatan!</template>
            Survei ini memiliki {{ itemToDelete.children?.length || 0 }} detail survei. 
            Menghapus survei parent akan menghapus semua detail survei juga.
          </v-alert>
          
          Apakah Anda yakin ingin menghapus survei: 
          <strong>{{ itemToDelete?.nama }}</strong>?
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>
          <v-btn
            color="error"
            :loading="loading"
            @click="deleteSurvei"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSurveiService } from '../services/surveiService'
import { useTipePeriodeService } from '../services/tipePeriodeService'
import type { Survei, CreateSurveiPayload, UpdateSurveiPayload } from '../types/survei'
import type { TipePeriode } from '../types/tipePeriode'

// Services
const surveiService = useSurveiService()
const tipePeriodeService = useTipePeriodeService()

// Reactive data
const surveiList = ref<Survei[]>([])
const tipePeriodsOptions = ref<TipePeriode[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Dialog states
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const isCreateChild = ref(false)
const selectedParent = ref<Survei | null>(null)
const itemToDelete = ref<Survei | null>(null)

// Form
const formRef = ref()

// Interface untuk form data yang mencakup id untuk editing
interface FormData extends CreateSurveiPayload {
  id?: number
}

const formData = ref<FormData>({
  nama: '',
  tipe_periode: null,
  is_parent: true,
  parent_survei_id: null
})

// Table headers
const headers = [
  { title: 'Nama Survei', key: 'nama', sortable: true },
  { title: 'Tipe Periode', key: 'tipe_periode_data', sortable: false },
  { title: 'Aksi', key: 'actions', sortable: false, width: '200px' }
]

// Computed
const surveiItems = computed(() => {
  // Susun hierarchy: parent dulu, kemudian children
  const result: any[] = []
  
  surveiList.value.forEach(survei => {
    if (survei.is_parent) {
      result.push(survei)
      // Tambahkan children setelah parent
      if (survei.children) {
        survei.children.forEach(child => {
          result.push({
            ...child,
            // Tambahkan referensi parent untuk keperluan tampilan
            parent_nama: survei.nama
          })
        })
      }
    } else if (!survei.parent_survei_id) {
      // Survei standalone (bukan parent, tapi juga bukan child)
      result.push(survei)
    }
  })
  
  return result
})

const parentOptions = computed(() => {
  return surveiList.value.filter(s => s.is_parent)
})

// Computed untuk search/filter
const filteredSurveiItems = computed(() => {
  if (!searchQuery.value) {
    return surveiItems.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return surveiItems.value.filter(item => 
    item.nama.toLowerCase().includes(query) ||
    item.tipe_periode_data?.nama_tipe.toLowerCase().includes(query) ||
    (item.parent_nama && item.parent_nama.toLowerCase().includes(query))
  )
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [surveis, tipePeriods] = await Promise.all([
      surveiService.getSurveis(),
      tipePeriodeService.getTipePeriodes()
    ])
    
    surveiList.value = surveis
    tipePeriodsOptions.value = tipePeriods
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  isCreateChild.value = false
  selectedParent.value = null
  resetForm()
  dialog.value = true
}

const openCreateChildDialog = (parent: Survei) => {
  isEdit.value = false
  isCreateChild.value = true
  selectedParent.value = parent
  resetForm()
  formData.value.parent_survei_id = parent.id
  formData.value.is_parent = false
  // Ambil tipe_periode dari parent
  formData.value.tipe_periode = parent.tipe_periode
  dialog.value = true
}

const openEditDialog = (item: Survei) => {
  isEdit.value = true
  isCreateChild.value = false
  selectedParent.value = null
  formData.value = {
    id: item.id,
    nama: item.nama,
    tipe_periode: item.tipe_periode,
    is_parent: item.is_parent,
    parent_survei_id: item.parent_survei_id
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    nama: '',
    tipe_periode: null,
    is_parent: true,
    parent_survei_id: null
  }
  formRef.value?.resetValidation()
}

const submitForm = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    if (isEdit.value) {
      const payload: UpdateSurveiPayload = {
        nama: formData.value.nama,
        tipe_periode: formData.value.tipe_periode,
        is_parent: formData.value.is_parent,
        parent_survei_id: formData.value.parent_survei_id
      }
      await surveiService.updateSurvei(formData.value.id!, payload)
    } else {
      await surveiService.createSurvei(formData.value)
    }
    
    await loadData()
    closeDialog()
  } catch (error) {
    console.error('Error saving survei:', error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item: Survei) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const deleteSurvei = async () => {
  if (!itemToDelete.value) return

  loading.value = true
  try {
    await surveiService.deleteSurvei(itemToDelete.value.id)
    await loadData()
    deleteDialog.value = false
    itemToDelete.value = null
  } catch (error) {
    console.error('Error deleting survei:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hierarchy-indent {
  padding-left: 24px;
}
</style>
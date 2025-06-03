<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useSurveiService } from '../services/surveiService'
import { useTipePeriodeService } from '../services/tipePeriodeService'
import type { Survei, CreateSurveiPayload, UpdateSurveiPayload } from '../types/survei'
import type { TipePeriode } from '../types/tipePeriode'

const { getSurveis, createSurvei, updateSurvei, deleteSurvei, loading, error } = useSurveiService()
const { getTipePeriodes } = useTipePeriodeService()

const search = ref('')
const surveiList = ref<Survei[]>([])
const tipePeriodeList = ref<TipePeriode[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const defaultCreatePayload: CreateSurveiPayload = {
  nama: '',
  tipe_periode: null
}

const defaultUpdatePayload: UpdateSurveiPayload = {
  nama: '',
  tipe_periode: null
}

const editedItem = reactive<CreateSurveiPayload | UpdateSurveiPayload>({ ...defaultCreatePayload })
const editedId = ref<number | null>(null)

// Computed untuk filter search
const filteredSurveiList = computed(() => {
  if (!search.value) return surveiList.value
  return surveiList.value.filter(item => 
    item.nama.toLowerCase().includes(search.value.toLowerCase()) ||
    item.tipe_periode_data?.nama_tipe?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const resetForm = () => {
  Object.assign(editedItem, defaultCreatePayload)
  editedId.value = null
}

const showNotification = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const fetchSurveis = async () => {
  try {
    surveiList.value = await getSurveis()
  } catch (err) {
    console.error('Error fetching surveis:', err)
    showNotification('Gagal memuat data survei', 'error')
  }
}

const fetchTipePeriodes = async () => {
  try {
    tipePeriodeList.value = await getTipePeriodes()
  } catch (err) {
    console.error('Error fetching tipe periodes:', err)
    showNotification('Gagal memuat data tipe periode', 'error')
  }
}

onMounted(async () => {
  await Promise.all([fetchSurveis(), fetchTipePeriodes()])
})

const handleCreate = async () => {
  try {
    const result = await createSurvei(editedItem as CreateSurveiPayload)
    if (result) {
      editDialog.value = false
      resetForm()
      await fetchSurveis()
      showNotification('Survei berhasil ditambahkan!')
    } else {
      showNotification('Gagal menambahkan survei. ' + (error.value || ''), 'error')
    }
  } catch (err: any) {
    showNotification('Terjadi kesalahan: ' + err.message, 'error')
  }
}

const handleUpdate = async () => {
  if (editedId.value !== null) {
    try {
      const result = await updateSurvei(editedId.value, editedItem as UpdateSurveiPayload)
      if (result) {
        editDialog.value = false
        resetForm()
        await fetchSurveis()
        showNotification('Survei berhasil diperbarui!')
      } else {
        showNotification('Gagal memperbarui survei. ' + (error.value || ''), 'error')
      }
    } catch (err: any) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error')
    }
  }
}

const handleDelete = async () => {
  if (editedId.value !== null) {
    try {
      const result = await deleteSurvei(editedId.value)
      if (result) {
        deleteDialog.value = false
        resetForm()
        await fetchSurveis()
        showNotification('Survei berhasil dihapus!')
      } else {
        showNotification('Gagal menghapus survei. ' + (error.value || ''), 'error')
      }
    } catch (err: any) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error')
    }
  }
}

const openCreateDialog = () => {
  resetForm()
  isCreating.value = true
  editDialog.value = true
}

const openEditDialog = (item: Survei) => {
  Object.assign(editedItem, {
    nama: item.nama,
    tipe_periode: item.tipe_periode
  })
  editedId.value = item.id
  isCreating.value = false
  editDialog.value = true
}

const openDeleteDialog = (item: Survei) => {
  editedId.value = item.id
  deleteDialog.value = true
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Manajemen Survei</span>
      <VBtn color="primary" prepend-icon="ri-add-line" @click="openCreateDialog">
        Tambah Survei
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VTextField
        v-model="search"
        placeholder="Cari survei..."
        prepend-inner-icon="ri-search-line"
        density="compact"
        hide-details
        clearable
        class="mb-4"
      />

      <VDataTable
        :headers="[
          { title: 'Nama Survei', key: 'nama', sortable: true },
          { title: 'Tipe Periode', key: 'tipe_periode_data.nama_tipe', sortable: true },
          { title: 'Aksi', key: 'actions', sortable: false }
        ]"
        :items="filteredSurveiList"
        :loading="loading"
        class="mt-4"
      >
        <template #item.tipe_periode_data.nama_tipe="{ item }">
          {{ item.tipe_periode_data?.nama_tipe || '-' }}
        </template>
        
        <template #item.actions="{ item }">
          <VBtn
            icon="ri-edit-line"
            variant="text"
            size="small"
            color="primary"
            class="me-2"
            @click="openEditDialog(item)"
          />
          <VBtn
            icon="ri-delete-bin-line"
            variant="text"
            size="small"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </template>
      </VDataTable>
    </VCardText>
  </VCard>

  <!-- Edit Dialog -->
  <VDialog v-model="editDialog" max-width="600">
    <VCard>
      <VCardTitle>
        {{ isCreating ? 'Tambah Survei' : 'Edit Survei' }}
      </VCardTitle>
      <VCardText>
        <VForm @submit.prevent="isCreating ? handleCreate() : handleUpdate()">
          <VTextField
            v-model="editedItem.nama"
            label="Nama Survei"
            :rules="[v => !!v || 'Nama survei harus diisi']"
            required
            class="mb-4"
          />
          
          <VSelect
            v-model="editedItem.tipe_periode"
            :items="tipePeriodeList"
            item-title="nama_tipe"
            item-value="id"
            label="Tipe Periode"
            :rules="[v => v !== null || 'Tipe periode harus dipilih']"
            required
            clearable
            class="mb-4"
          />

          <div class="d-flex justify-end gap-3">
            <VBtn @click="editDialog = false">
              Batal
            </VBtn>
            <VBtn
              color="primary"
              type="submit"
              :loading="loading"
              :disabled="!editedItem.nama || editedItem.tipe_periode === null"
            >
              {{ isCreating ? 'Simpan' : 'Update' }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Delete Dialog -->
  <VDialog v-model="deleteDialog" max-width="500">
    <VCard>
      <VCardTitle>Konfirmasi Hapus</VCardTitle>
      <VCardText>
        Apakah Anda yakin ingin menghapus survei ini?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="deleteDialog = false">
          Batal
        </VBtn>
        <VBtn
          color="error"
          @click="handleDelete"
          :loading="loading"
        >
          Hapus
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Snackbar for notifications -->
  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="3000"
    location="top"
  >
    {{ snackbarMessage }}
    <template #actions>
      <VBtn
        color="white"
        variant="text"
        @click="snackbar = false"
      >
        Tutup
      </VBtn>
    </template>
  </VSnackbar>
</template>

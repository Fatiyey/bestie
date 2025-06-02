<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useTipePeriodeService } from '../services/tipePeriodeService'
import type { TipePeriode, CreateTipePeriodePayload, UpdateTipePeriodePayload } from '../types/tipePeriode'

const { getTipePeriodes, createTipePeriode, updateTipePeriode, deleteTipePeriode, loading } = useTipePeriodeService()

const search = ref('')
const tipePeriodeList = ref<TipePeriode[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(false)

const defaultCreatePayload: CreateTipePeriodePayload = {
  nama_tipe: ''
}

const defaultUpdatePayload: UpdateTipePeriodePayload = {
  nama_tipe: ''
}

const editedItem = reactive<CreateTipePeriodePayload | UpdateTipePeriodePayload>({ ...defaultCreatePayload })
const editedId = ref<number | null>(null)

const resetForm = () => {
  Object.assign(editedItem, defaultCreatePayload)
  editedId.value = null
}

const fetchTipePeriodes = async () => {
  tipePeriodeList.value = await getTipePeriodes()
}

onMounted(fetchTipePeriodes)

const handleCreate = async () => {
  await createTipePeriode(editedItem as CreateTipePeriodePayload)
  editDialog.value = false
  resetForm()
  await fetchTipePeriodes()
}

const handleUpdate = async () => {
  if (editedId.value !== null) {
    await updateTipePeriode(editedId.value, editedItem as UpdateTipePeriodePayload)
    editDialog.value = false
    resetForm()
    await fetchTipePeriodes()
  }
}

const handleDelete = async () => {
  if (editedId.value !== null) {
    await deleteTipePeriode(editedId.value)
    deleteDialog.value = false
    resetForm()
    await fetchTipePeriodes()
  }
}

const openCreateDialog = () => {
  resetForm()
  isCreating.value = true
  editDialog.value = true
}

const openEditDialog = (item: TipePeriode) => {
  Object.assign(editedItem, {
    nama_tipe: item.nama_tipe
  })
  editedId.value = item.id
  isCreating.value = false
  editDialog.value = true
}
</script>

<template>
  <v-card>
    <v-card-title>Manajemen Tipe Periode</v-card-title>
    <v-card-text>
      <v-btn color="primary" prepend-icon="ri-add-line" @click="openCreateDialog">
        Tambah Tipe Periode
      </v-btn>
      
      <v-data-table
        :headers="[
          { title: 'Nama Tipe', key: 'nama_tipe', sortable: true },
          { title: 'Aksi', key: 'actions', sortable: false }
        ]"
        :items="tipePeriodeList"
        :loading="loading"
        class="mt-4"
      >
        <template #item.actions="{ item }">
          <v-btn 
            icon="ri-edit-line"
            size="small"
            color="primary"
            class="me-2"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="ri-delete-bin-line"
            size="small"
            color="error"
            @click="() => { editedId.value = item.id; deleteDialog.value = true }"
          />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="editDialog" max-width="400">
    <v-card>
      <v-card-title>{{ isCreating ? 'Tambah' : 'Edit' }} Tipe Periode</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editedItem.nama_tipe"
          label="Nama Tipe"
          required
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="editDialog = false">Batal</v-btn>
        <v-btn 
          color="primary" 
          @click="isCreating ? handleCreate() : handleUpdate()"
        >
          {{ isCreating ? 'Simpan' : 'Update' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="300">
    <v-card>
      <v-card-title>Konfirmasi Hapus</v-card-title>
      <v-card-text>
        Apakah Anda yakin ingin menghapus tipe periode ini?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="deleteDialog = false">Batal</v-btn>
        <v-btn color="error" @click="handleDelete">Hapus</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

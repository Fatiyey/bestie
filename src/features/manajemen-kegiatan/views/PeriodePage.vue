<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { usePeriodeService } from '../services/periodeService'
import { useTipePeriodeService } from '../services/tipePeriodeService'
import type { Periode, CreatePeriodePayload, UpdatePeriodePayload } from '../types/periode'
import type { TipePeriode } from '../types/tipePeriode'

const { getPeriodes, createPeriode, updatePeriode, deletePeriode, loading, error } = usePeriodeService()
const { getTipePeriodes } = useTipePeriodeService()

const search = ref('')
const periodeList = ref<Periode[]>([])
const tipePeriodeList = ref<TipePeriode[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(false)

const defaultCreatePayload: CreatePeriodePayload = {
  nama_periode: '',
  tipe_periode_id: null
}

const defaultUpdatePayload: UpdatePeriodePayload = {
  nama_periode: '',
  tipe_periode_id: null
}

const editedItem = reactive<CreatePeriodePayload | UpdatePeriodePayload>({ ...defaultCreatePayload })
const editedId = ref<number | null>(null)

const resetForm = () => {
  Object.assign(editedItem, defaultCreatePayload)
  editedId.value = null
}

const fetchPeriodes = async () => {
  periodeList.value = await getPeriodes()
}

const fetchTipePeriodes = async () => {
  tipePeriodeList.value = await getTipePeriodes()
}

onMounted(async () => {
  await Promise.all([fetchPeriodes(), fetchTipePeriodes()])
})

const handleCreate = async () => {
  await createPeriode(editedItem as CreatePeriodePayload)
  editDialog.value = false
  resetForm()
  await fetchPeriodes()
}

const handleUpdate = async () => {
  if (editedId.value !== null) {
    await updatePeriode(editedId.value, editedItem as UpdatePeriodePayload)
    editDialog.value = false
    resetForm()
    await fetchPeriodes()
  }
}

const handleDelete = async () => {
  if (editedId.value !== null) {
    await deletePeriode(editedId.value)
    deleteDialog.value = false
    resetForm()
    await fetchPeriodes()
  }
}

const openCreateDialog = () => {
  resetForm()
  isCreating.value = true
  editDialog.value = true
}

const openEditDialog = (item: Periode) => {
  Object.assign(editedItem, {
    nama_periode: item.nama_periode,
    tipe_periode_id: item.tipe_periode_id
  })
  editedId.value = item.id
  isCreating.value = false
  editDialog.value = true
}
</script>

<template>
  <v-card>
    <v-card-title>Manajemen Periode</v-card-title>
    <v-card-text>
      <v-btn color="primary" prepend-icon="ri-add-line" @click="openCreateDialog">
        Tambah Periode
      </v-btn>
      
      <v-data-table
        :headers=" [
          { title: 'Nama Periode', key: 'nama_periode', sortable: true },
          { title: 'Tipe Periode', key: 'tipe_periode.nama_tipe', sortable: true },
          { title: 'Aksi', key: 'actions', sortable: false }
        ]"
        :items="periodeList"
        :loading="loading"
        class="mt-4"
      >
        <template #item.tipe_periode.nama_tipe="{ item }">
          {{ item.tipe_periode?.nama_tipe || '-' }}
        </template>
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
      <v-card-title>{{ isCreating ? 'Tambah' : 'Edit' }} Periode</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editedItem.nama_periode"
          label="Nama Periode"
          required
        />
        <v-select
          v-model="editedItem.tipe_periode_id"
          :items="tipePeriodeList"
          item-title="nama_tipe"
          item-value="id"
          label="Tipe Periode"
          clearable
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
        Apakah Anda yakin ingin menghapus periode ini?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="deleteDialog = false">Batal</v-btn>
        <v-btn color="error" @click="handleDelete">Hapus</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useSurveiService } from '../services/surveiService'
import { useTipePeriodeService } from '../services/tipePeriodeService'
import type { Survei, CreateSurveiPayload, UpdateSurveiPayload } from '../types'
import type { TipePeriode } from '../types'

const { getSurveis, createSurvei, updateSurvei, deleteSurvei, loading } = useSurveiService()
const { getTipePeriodes } = useTipePeriodeService()

const search = ref('')
const surveiList = ref<Survei[]>([])
const tipePeriodeList = ref<TipePeriode[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(false)

const defaultCreatePayload: CreateSurveiPayload = {
  nama: '',
  tipe_periode_id: null
}

const defaultUpdatePayload: UpdateSurveiPayload = {
  nama: '',
  tipe_periode_id: null
}

const editedItem = reactive<CreateSurveiPayload | UpdateSurveiPayload>({ ...defaultCreatePayload })
const editedId = ref<number | null>(null)

const resetForm = () => {
  Object.assign(editedItem, defaultCreatePayload)
  editedId.value = null
}

const fetchSurveis = async () => {
  surveiList.value = await getSurveis()
}

const fetchTipePeriodes = async () => {
  tipePeriodeList.value = await getTipePeriodes()
}

onMounted(async () => {
  await Promise.all([fetchSurveis(), fetchTipePeriodes()])
})

const handleCreate = async () => {
  await createSurvei(editedItem as CreateSurveiPayload)
  editDialog.value = false
  resetForm()
  await fetchSurveis()
}

const handleUpdate = async () => {
  if (editedId.value !== null) {
    await updateSurvei(editedId.value, editedItem as UpdateSurveiPayload)
    editDialog.value = false
    resetForm()
    await fetchSurveis()
  }
}

const handleDelete = async () => {
  if (editedId.value !== null) {
    await deleteSurvei(editedId.value)
    deleteDialog.value = false
    resetForm()
    await fetchSurveis()
  }
}

const editItem = (item: Survei) => {
  editedId.value = item.id
  Object.assign(editedItem, {
    nama: item.nama,
    tipe_periode_id: item.tipe_periode_id
  })
  editDialog.value = true
  isCreating.value = false
}

const deleteItem = (item: Survei) => {
  editedId.value = item.id
  Object.assign(editedItem, {
    nama: item.nama,
    tipe_periode_id: item.tipe_periode_id
  })
  deleteDialog.value = true
}
    deleteDialog.value = false
    resetForm()
    await fetchSurveis()
  }
}

const editItem = (item: Survei) => {
  editedId.value = item.id
  Object.assign(editedItem, {
    nama: item.nama,
    periode_id: item.periode_id,
    tipe_periode_id: item.tipe_periode_id
  })
  editDialog.value = true
  isCreating.value = false
}

const deleteItem = (item: Survei) => {
  editedId.value = item.id
  Object.assign(editedItem, {
    nama: item.nama,
    periode_id: item.periode_id,
    tipe_periode_id: item.tipe_periode_id
  })
  deleteDialog.value = true
}

const addNewItem = () => {
  resetForm()
  editDialog.value = true
  isCreating.value = true
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Survei</span>
      <VBtn color="primary" @click="addNewItem">
        Tambah Survei
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VTextField
        v-model="search"
        placeholder="Cari survei..."
        density="compact"
        hide-details
        class="mb-4"
      />

      <VTable>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tipe Periode</th>
            <th>Periode</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in surveiList" :key="item.id">
            <td>{{ item.nama }}</td>
            <td>{{ item.tipe_periode?.nama_tipe }}</td>
            <td>{{ item.periode?.nama_periode }}</td>
            <td>
              <VBtn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="editItem(item)"
              >
                <VIcon size="20">mdi-pencil-outline</VIcon>
              </VBtn>
              <VBtn
                icon
                variant="text"
                size="small"
                color="error"
                @click="deleteItem(item)"
              >
                <VIcon size="20">mdi-delete-outline</VIcon>
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>

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
              required
            />
            
            <VSelect
              v-model="editedItem.tipe_periode_id"
              :items="tipePeriodeList"
              item-title="nama_tipe"
              item-value="id"
              label="Tipe Periode"
            />

            <VSelect
              v-model="editedItem.periode_id"
              :items="filteredPeriodeList"
              item-title="nama_periode"
              item-value="id"
              label="Periode"
              :disabled="!editedItem.tipe_periode_id"
            />

            <div class="d-flex justify-end gap-3 mt-3">
              <VBtn @click="editDialog = false">
                Batal
              </VBtn>
              <VBtn
                color="primary"
                type="submit"
                :loading="loading"
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
        <VCardTitle>Hapus Survei</VCardTitle>
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
  </VCard>
</template>

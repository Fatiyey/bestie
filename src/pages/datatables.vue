<script setup lang="ts">
import { ref, onMounted } from 'vue'
import data from '@/data/datatables'
import type { Data } from '@/types/datatables'

const editDialog = ref(false)
const deleteDialog = ref(false)
const search = ref('')
const loading = ref(false)

// Table options
const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: ['fullName'],
  sortDesc: [false],
})

const defaultItem = ref<Data>({
  id: -1,
  fullName: '',
  post: '',
  email: '',
  city: '',
  startDate: '',
  salary: 0,
  age: '',
  experience: '',
  status: 1,
})

const editedItem = ref<Data>(defaultItem.value)
const editedIndex = ref(-1)
const userList = ref<Data[]>([])

// Status options
const selectedOptions = [
  { text: 'Current', value: 1 },
  { text: 'Professional', value: 2 },
  { text: 'Rejected', value: 3 },
  { text: 'Resigned', value: 4 },
  { text: 'Applied', value: 5 },
]

// Headers
const headers = [
  { title: 'NAME', key: 'fullName', sortable: true },
  { title: 'EMAIL', key: 'email', sortable: true },
  { title: 'DATE', key: 'startDate', sortable: true },
  { title: 'SALARY', key: 'salary', sortable: true },
  { title: 'AGE', key: 'age', sortable: true },
  { title: 'STATUS', key: 'status', sortable: true },
  { title: 'ACTIONS', key: 'actions', sortable: false },
]

const resolveStatusVariant = (status: number) => {
  if (status === 1)
    return { color: 'primary', text: 'Current' }
  else if (status === 2)
    return { color: 'success', text: 'Professional' }
  else if (status === 3)
    return { color: 'error', text: 'Rejected' }
  else if (status === 4)
    return { color: 'warning', text: 'Resigned' }
  else
    return { color: 'info', text: 'Applied' }
}

const avatarText = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

// Methods
const editItem = (item: Data) => {
  editedIndex.value = userList.value.indexOf(item)
  editedItem.value = { ...item }
  editDialog.value = true
}

const deleteItem = (item: Data) => {
  editedIndex.value = userList.value.indexOf(item)
  editedItem.value = { ...item }
  deleteDialog.value = true
}

const close = () => {
  editDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

const closeDelete = () => {
  deleteDialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

const save = () => {
  if (editedIndex.value > -1)
    Object.assign(userList.value[editedIndex.value], editedItem.value)
  else
    userList.value.push(editedItem.value)

  close()
}

const deleteItemConfirm = () => {
  userList.value.splice(editedIndex.value, 1)
  closeDelete()
}

onMounted(() => {
  userList.value = JSON.parse(JSON.stringify(data))
})
</script>

<template>
  <VCard>
    <!-- 👉 Table Header -->
    <VCardTitle class="d-flex flex-wrap py-4">
      <div class="d-flex align-center flex-grow-1">
        <VSpacer />
        <VTextField
          v-model="search"
          placeholder="Search"
          density="compact"
          prepend-inner-icon="ri-search-line"
          single-line
          hide-details
          variant="outlined"
          style="max-width: 250px"
        />
      </div>
    </VCardTitle>

    <VDivider />

    <!-- 👉 Datatable -->
    <VDataTable
      v-model:options="options"
      :headers="headers"
      :items="userList"
      :search="search"
      :loading="loading"
      class="text-no-wrap"
    >
      <!-- Loading -->
      <template #loading>
        <VSkeletonLoader
          type="table-row-divider"
          :loading="loading"
        />
      </template>

      <!-- Name Column -->
      <template #item.fullName="{ item }">
        <div class="d-flex align-center">
          <VAvatar
            size="32"
            :color="item.avatar ? '' : 'primary'"
            :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
            :variant="!item.avatar ? 'tonal' : undefined"
          >
            <VImg
              v-if="item.avatar"
              :src="item.avatar"
            />
            <span
              v-else
              class="text-sm"
            >{{ avatarText(item.fullName) }}</span>
          </VAvatar>

          <div class="d-flex flex-column ms-3">
            <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.fullName }}</span>
            <small>{{ item.post }}</small>
          </div>
        </div>
      </template>

      <!-- Status Column -->
      <template #item.status="{ item }">
        <VChip
          :color="resolveStatusVariant(item.status).color"
          size="small"
          class="text-capitalize"
          variant="tonal"
        >
          {{ resolveStatusVariant(item.status).text }}
        </VChip>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <VBtn
            icon
            variant="text"
            size="small"
            color="default"
            @click="editItem(item)"
          >
            <VIcon icon="ri-pencil-line" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="default"
            @click="deleteItem(item)"
          >
            <VIcon icon="ri-delete-bin-line" />
          </VBtn>
        </div>
      </template>

      <!-- Empty State -->
      <template #no-data>
        <div class="text-center py-6">
          <h4 class="text-h4 mb-2">No data available</h4>
          <p class="text-body-1">No records found</p>
        </div>
      </template>
    </VDataTable>

    <!-- 👉 Edit Dialog -->
    <VDialog
      v-model="editDialog"
      max-width="600px"
      persistent
    >
      <VCard title="Edit Item">
        <VCardText>
          <div class="text-body-1 mb-6">
            Name: <span class="text-h6">{{ editedItem?.fullName }}</span>
          </div>
          <VRow>
            <!-- Full Name -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.fullName"
                label="User name"
                :rules="[v => !!v || 'Name is required']"
              />
            </VCol>

            <!-- Email -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.email"
                label="Email"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
              />
            </VCol>

            <!-- Salary -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model.number="editedItem.salary"
                label="Salary"
                prefix="$"
                type="number"
                :rules="[v => v >= 0 || 'Salary must be positive']"
              />
            </VCol>

            <!-- Age -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.age"
                label="Age"
                type="number"
                :rules="[v => v > 0 || 'Age must be positive']"
              />
            </VCol>

            <!-- Start Date -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.startDate"
                label="Date"
                :rules="[v => !!v || 'Date is required']"
              />
            </VCol>

            <!-- Status -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editedItem.status"
                :items="selectedOptions"
                item-title="text"
                item-value="value"
                label="Status"
                :rules="[v => !!v || 'Status is required']"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            color="error"
            variant="outlined"
            @click="close"
          >
            Cancel
          </VBtn>
          <VBtn
            color="success"
            @click="save"
          >
            Save
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 Delete Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="500px"
      persistent
    >
      <VCard title="Delete Item">
        <VCardText>
          Are you sure you want to delete this item?
        </VCardText>
        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            color="error"
            variant="outlined"
            @click="closeDelete"
          >
            Cancel
          </VBtn>
          <VBtn
            color="success"
            @click="deleteItemConfirm"
          >
            OK
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </VCard>
</template>

<style lang="scss" scoped>
.v-data-table {
  --v-table-header-height: 56px;
  --v-table-row-height: 50px;
  width: 100%;

  :deep(th) {
    font-weight: 600 !important;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }
}

.text-sm {
  font-size: 0.875rem;
}
</style>

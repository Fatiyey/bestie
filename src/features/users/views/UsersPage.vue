<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserService } from '../services/userService'
import type { User, CreateUserPayload, UpdateUserPayload } from '../types'
import { useAuthService } from '@/features/auth/services/authService'
import { supabase } from '@/plugins/supabase'

const { authState } = useAuthService()
const { getUsers, createUser, updateUser, deleteUser, loading, error } = useUserService()

// Table data
const search = ref('')
const userList = ref<User[]>([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const isCreating = ref(false)

// Table options
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: ['created_at'],
  sortDesc: [true],
})

// Form data
const defaultCreatePayload = ref<CreateUserPayload>({
  email: '',
  name: '',
  password: '',
  role: 'staff',
  position: '',
  phone_number: '',
})

const defaultUpdatePayload = ref<UpdateUserPayload>({
  name: '',
  role: '',
  position: '',
  phone_number: '',
  is_active: true,
})

const editedItem = ref<CreateUserPayload | UpdateUserPayload>(defaultCreatePayload.value)
const editedId = ref<string>('')

// Check if user is admin
const isAdmin = ref(false)
const checkIsAdmin = async () => {
  if (!authState.value.user?.id) return false
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('auth_uid', authState.value.user.id)
    .single()
  
  return data?.role === 'admin'
}

// Headers
const headers = [
  { title: 'NAME', key: 'name', sortable: true },
  { title: 'EMAIL', key: 'email', sortable: true },
  { title: 'POSITION', key: 'position', sortable: true },
  { title: 'ROLE', key: 'role', sortable: true },
  { title: 'PHONE', key: 'phone_number', sortable: true },
  { title: 'STATUS', key: 'is_active', sortable: true },
  { title: 'ACTIONS', key: 'actions', sortable: false },
]

// Role options
const roleOptions = [
  { text: 'Staff', value: 'staff' },
  { text: 'Admin', value: 'admin' },
]

// Methods
const loadUsers = async () => {
  const data = await getUsers()
  userList.value = data
}

const editItem = (item: User) => {
  isCreating.value = false
  editedId.value = item.id
  editedItem.value = {
    name: item.name || '',
    role: item.role || '',
    position: item.position || '',
    phone_number: item.phone_number || '',
    is_active: item.is_active || true,
  }
  editDialog.value = true
}

const addItem = () => {
  isCreating.value = true
  editedId.value = ''
  editedItem.value = { ...defaultCreatePayload.value }
  editDialog.value = true
}

const deleteItem = (item: User) => {
  editedId.value = item.id
  deleteDialog.value = true
}

const close = () => {
  editDialog.value = false
  editedId.value = ''
  editedItem.value = isCreating.value ? { ...defaultCreatePayload.value } : { ...defaultUpdatePayload.value }
  isCreating.value = false
}

const closeDelete = () => {
  deleteDialog.value = false
  editedId.value = ''
}

const save = async () => {
  if (editedId.value) {
    // Update
    await updateUser(editedId.value, editedItem.value as UpdateUserPayload)
  } else {
    // Create
    await createUser(editedItem.value as CreateUserPayload)
  }
  
  await loadUsers()
  close()
}

const deleteItemConfirm = async () => {
  if (editedId.value) {
    await deleteUser(editedId.value)
    await loadUsers()
  }
  closeDelete()
}

const resolveStatusColor = (isActive: boolean | null) => {
  return isActive ? 'success' : 'error'
}

const resolveStatusText = (isActive: boolean | null) => {
  return isActive ? 'Active' : 'Inactive'
}

// Load users on mount
onMounted(async () => {
  isAdmin.value = await checkIsAdmin()
  if (isAdmin.value) {
    loadUsers()
  }
})
</script>

<template>
  <VCard v-if="isAdmin">
    <!-- Table Header -->
    <VCardTitle class="d-flex flex-wrap py-4">
      <div class="me-4 py-1">
        <h2>Users</h2>
      </div>
      <VSpacer />
      <div class="d-flex gap-4">
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
        <VBtn
          color="primary"
          @click="addItem"
        >
          Add User
        </VBtn>
      </div>
    </VCardTitle>

    <VDivider />

    <!-- Table -->
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

      <!-- Status Column -->
      <template #item.is_active="{ item }">
        <VChip
          :color="resolveStatusColor(item.is_active)"
          size="small"
          class="text-capitalize"
        >
          {{ resolveStatusText(item.is_active) }}
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
    </VDataTable>

    <!-- Add/Edit Dialog -->
    <VDialog
      v-model="editDialog"
      max-width="600px"
      persistent
    >
      <VCard :title="editedId ? 'Edit User' : 'Add User'">
        <VCardText>
          <VRow>
            <!-- Email -->
            <VCol
              v-if="isCreating"
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="(editedItem as CreateUserPayload).email"
                label="Email"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
              />
            </VCol>

            <!-- Password -->
            <VCol
              v-if="isCreating"
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="(editedItem as CreateUserPayload).password"
                label="Password"
                type="password"
                :rules="[v => !!v || 'Password is required']"
              />
            </VCol>

            <!-- Name -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.name"
                label="Name"
                :rules="[v => !!v || 'Name is required']"
              />
            </VCol>

            <!-- Role -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editedItem.role"
                :items="roleOptions"
                item-title="text"
                item-value="value"
                label="Role"
              />
            </VCol>

            <!-- Position -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.position"
                label="Position"
              />
            </VCol>

            <!-- Phone -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editedItem.phone_number"
                label="Phone Number"
              />
            </VCol>

            <!-- Status -->
            <VCol
              v-if="!isCreating"
              cols="12"
              sm="6"
            >
              <VSwitch
                v-model="(editedItem as UpdateUserPayload).is_active"
                label="Active"
                color="success"
                hide-details
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

    <!-- Delete Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="500px"
      persistent
    >
      <VCard title="Delete User">
        <VCardText>
          Are you sure you want to delete this user?
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
  <VCard v-else>
    <VCardText class="text-center py-6">
      <h4 class="text-h4 mb-2">Access Denied</h4>
      <p class="text-body-1">You don't have permission to access this page</p>
    </VCardText>
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
</style>

<template>
  <VLayout class="members-layout bg-surface">
    <!-- Member List Sidebar -->
    <MemberListSidebar 
      v-model="isMemberListSidebarOpen"
      :members="members"
      v-model:selected-members="selectedMembersMap"
    />

    <!-- Main Content -->
    <VMain class="members-content-container">
      <div class="d-flex flex-column h-100">
        <!-- Header -->
        <div class="members-header d-flex align-center text-medium-emphasis pa-4">
          <VBtn 
            icon 
            variant="text" 
            class="d-md-none me-4" 
            @click="isMemberListSidebarOpen = !isMemberListSidebarOpen"
          >
            <VIcon icon="ri-menu-line" />
          </VBtn>
          <div class="d-flex align-center">
            <h6 class="text-h6 font-weight-regular mb-0">Members</h6>
            <VDivider vertical class="mx-4" />
            <span class="text-body-2">{{ selectedMembersCount }} selected</span>
          </div>
          <VSpacer />
          <VBtn 
            v-if="selectedMembersCount > 0"
            variant="text" 
            @click="isMemberDetailsSidebarOpen = true"
          >
            View Details
          </VBtn>
        </div>
        <VDivider />

        <!-- Content -->
        <div class="flex-grow-1 d-flex justify-center align-center">
          <div v-if="loading" class="text-center">
            <VProgressCircular indeterminate />
          </div>
          <div v-else-if="error" class="text-center text-error">
            {{ error }}
          </div>
          <div v-else-if="selectedMembersCount === 0" class="text-center">
            <VIcon icon="ri-user-line" size="48" class="text-disabled mb-2" />
            <p class="text-h6 text-disabled">Select members to view details</p>
          </div>
          <div v-else class="text-center">
            <VIcon icon="ri-user-line" size="48" class="text-primary mb-2" />
            <p class="text-h6">{{ selectedMembersCount }} members selected</p>
            <VBtn 
              color="primary" 
              class="mt-4" 
              @click="isMemberDetailsSidebarOpen = true"
            >
              View Details
            </VBtn>
          </div>
        </div>
      </div>
    </VMain>

    <!-- Member Details Sidebar -->
    <MemberDetailsSidebar 
      v-model="isMemberDetailsSidebarOpen"
      :selected-members="selectedMembersList"
    />
  </VLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { Member, SelectedMembers } from '../types'
import { useMemberService } from '../services/memberService'
import MemberListSidebar from '../components/MemberListSidebar.vue'
import MemberDetailsSidebar from '../components/MemberDetailsSidebar.vue'

const { mdAndUp } = useDisplay()
const { loading, error, getMembers } = useMemberService()

const members = ref<Member[]>([])
const selectedMembersMap = ref<SelectedMembers>({})
const isMemberListSidebarOpen = ref(true)
const isMemberDetailsSidebarOpen = ref(false)

const selectedMembersCount = computed(() => 
  Object.values(selectedMembersMap.value).filter(Boolean).length
)

const selectedMembersList = computed(() => 
  members.value.filter(member => selectedMembersMap.value[member.id])
)

// Fetch members on component mount
onMounted(async () => {
  const data = await getMembers()
  members.value = data
})

// Adjust sidebar visibility based on screen size
watch(mdAndUp, val => {
  isMemberListSidebarOpen.value = val
}, { immediate: true })

// Close details sidebar when no members are selected
watch(selectedMembersCount, val => {
  if (val === 0) {
    isMemberDetailsSidebarOpen.value = false
  }
})
</script>

<style lang="scss">
.members-layout {
  height: calc(100vh - 64px - 48px - 24px);
}

.members-content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>

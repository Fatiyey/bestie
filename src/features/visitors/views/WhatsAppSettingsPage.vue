<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h4 class="text-h4 mb-1">WhatsApp Integration Settings</h4>
        <p class="text-body-1 text-medium-emphasis">
          Configure WhatsApp Business API for sending satisfaction surveys
        </p>
      </div>
    </div>

    <VRow>
      <VCol cols="12" md="8">
        <!-- Configuration Status -->
        <WhatsAppConfigStatus class="mb-6" />

        <!-- Setup Instructions -->
        <VCard>
          <VCardTitle>Setup Instructions</VCardTitle>
          <VCardText>
            <VExpansionPanels>
              <VExpansionPanel title="1. Environment Variables">
                <VExpansionPanelText>
                  <p class="mb-3">Update your <code>.env</code> file with the following variables:</p>
                  <pre class="bg-surface pa-3 rounded text-sm"><code># WhatsApp Configuration
VITE_WHATSAPP_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/whatsapp
VITE_WHATSAPP_SURVEY_FLOW_ID=your-survey-flow-id
VITE_WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-number-id</code></pre>
                </VExpansionPanelText>
              </VExpansionPanel>
              
              <VExpansionPanel title="2. Deploy Edge Function">
                <VExpansionPanelText>
                  <p class="mb-3">Deploy the WhatsApp edge function to Supabase:</p>
                  <pre class="bg-surface pa-3 rounded text-sm"><code># Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy edge function
supabase functions deploy whatsapp</code></pre>
                </VExpansionPanelText>
              </VExpansionPanel>
              
              <VExpansionPanel title="3. Create WhatsApp Flow">
                <VExpansionPanelText>
                  <div class="mb-3">
                    <p class="mb-2">Create a WhatsApp Flow in Meta Business Manager:</p>
                    <ol class="ms-4">
                      <li>Open Meta Business Manager</li>
                      <li>Go to WhatsApp Manager > Flows</li>
                      <li>Click "Create Flow"</li>
                      <li>Design your satisfaction survey flow</li>
                      <li>Publish the flow and copy the Flow ID</li>
                    </ol>
                  </div>
                </VExpansionPanelText>
              </VExpansionPanel>
              
              <VExpansionPanel title="4. Test Integration">
                <VExpansionPanelText>
                  <p class="mb-3">Use the test tools below to verify your setup:</p>
                  <VBtn
                    color="primary"
                    prepend-icon="ri-test-tube-line"
                    @click="openTestDialog"
                  >
                    Open Test Tool
                  </VBtn>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <!-- Quick Actions -->
        <VCard class="mb-6">
          <VCardTitle>Quick Actions</VCardTitle>
          <VCardText>
            <VBtn
              block
              color="primary"
              prepend-icon="ri-external-link-line"
              href="https://business.facebook.com/whatsapp/manager"
              target="_blank"
              class="mb-3"
            >
              Open WhatsApp Manager
            </VBtn>
            
            <VBtn
              block
              color="secondary"
              prepend-icon="ri-book-line"
              href="https://developers.facebook.com/docs/whatsapp/flows"
              target="_blank"
              class="mb-3"
            >
              WhatsApp Flows Documentation
            </VBtn>
            
            <VBtn
              block
              color="info"
              prepend-icon="ri-database-line"
              @click="openSupabaseDashboard"
              class="mb-3"
            >
              Supabase Dashboard
            </VBtn>
          </VCardText>
        </VCard>

        <!-- Statistics -->
        <VCard>
          <VCardTitle>Survey Statistics</VCardTitle>
          <VCardText>
            <VList>
              <VListItem>
                <VListItemTitle>Total Surveys Sent</VListItemTitle>
                <template #append>
                  <VChip color="primary" size="small">{{ stats.totalSent }}</VChip>
                </template>
              </VListItem>
              
              <VListItem>
                <VListItemTitle>Success Rate</VListItemTitle>
                <template #append>
                  <VChip color="success" size="small">{{ stats.successRate }}%</VChip>
                </template>
              </VListItem>
              
              <VListItem>
                <VListItemTitle>This Month</VListItemTitle>
                <template #append>
                  <VChip color="info" size="small">{{ stats.thisMonth }}</VChip>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Test Dialog -->
    <VDialog v-model="showTestDialog" max-width="600">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>WhatsApp Integration Test</span>
          <VBtn icon variant="text" @click="showTestDialog = false">
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="runTest">
            <VTextField
              v-model="testForm.phoneNumber"
              label="Test Phone Number"
              placeholder="628123456789"
              hint="WhatsApp ID format (country code + number)"
              persistent-hint
              class="mb-4"
            />
            
            <VTextField
              v-model="testForm.name"
              label="Test Name"
              placeholder="Test User"
              class="mb-4"
            />
            
            <VSelect
              v-model="testForm.testType"
              :items="testTypes"
              label="Test Type"
              class="mb-4"
            />
            
            <VAlert
              v-if="testResult"
              :type="testResult.success ? 'success' : 'error'"
              variant="tonal"
              class="mb-4"
            >
              {{ testResult.message }}
            </VAlert>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showTestDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            @click="runTest"
            :loading="testing"
          >
            Run Test
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWhatsAppService } from '../services/whatsappService'
import { formatToWhatsAppId } from '../utils/whatsappUtils'
import WhatsAppConfigStatus from '../components/WhatsAppConfigStatus.vue'

const { sendSatisfactionSurvey, sendSimpleSurveyMessage, getSurveyUrl } = useWhatsAppService()

const showTestDialog = ref(false)
const testing = ref(false)

const testForm = ref({
  phoneNumber: '',
  name: 'Test User',
  testType: 'text'
})

const testTypes = [
  { title: 'Text Message with Survey Link', value: 'text' },
  { title: 'WhatsApp Flow Survey', value: 'flow' }
]

const testResult = ref<{
  success: boolean
  message: string
} | null>(null)

const stats = ref({
  totalSent: 0,
  successRate: 0,
  thisMonth: 0
})

const openTestDialog = () => {
  showTestDialog.value = true
  testResult.value = null
}

const openSupabaseDashboard = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (supabaseUrl) {
    const projectRef = supabaseUrl.split('//')[1].split('.')[0]
    window.open(`https://supabase.com/dashboard/project/${projectRef}`, '_blank')
  }
}

const runTest = async () => {
  try {
    testing.value = true
    testResult.value = null

    if (!testForm.value.phoneNumber) {
      throw new Error('Phone number is required')
    }

    const waId = formatToWhatsAppId(testForm.value.phoneNumber)
    const testDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    if (testForm.value.testType === 'flow') {
      await sendSatisfactionSurvey(
        waId,
        testForm.value.name,
        testDate,
        'Test Survey'
      )
      testResult.value = {
        success: true,
        message: 'WhatsApp Flow test sent successfully!'
      }
    } else {
      const surveyUrl = getSurveyUrl('test-visitor-id')
      await sendSimpleSurveyMessage(
        waId,
        testForm.value.name,
        surveyUrl
      )
      testResult.value = {
        success: true,
        message: 'WhatsApp text message test sent successfully!'
      }
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || 'Test failed'
    }
  } finally {
    testing.value = false
  }
}

const loadStats = async () => {
  // TODO: Implement stats loading from database
  // For now, using mock data
  stats.value = {
    totalSent: 156,
    successRate: 94,
    thisMonth: 23
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss">
pre {
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

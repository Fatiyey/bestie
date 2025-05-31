<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      <VIcon icon="ri-whatsapp-line" class="me-2" />
      WhatsApp Configuration Status
    </VCardTitle>
    <VCardText>
      <VAlert
        v-if="configValidation.isValid"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        <VIcon icon="ri-check-line" class="me-2" />
        WhatsApp configuration is complete and ready to use.
      </VAlert>
      
      <VAlert
        v-else
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        <VIcon icon="ri-alert-line" class="me-2" />
        WhatsApp configuration incomplete. Missing environment variables:
        <ul class="mt-2">
          <li v-for="field in configValidation.missingFields" :key="field">
            {{ field }}
          </li>
        </ul>
      </VAlert>

      <VDivider class="my-4" />

      <h6 class="text-h6 mb-3">Current Configuration</h6>
      
      <VList>
        <VListItem>
          <VListItemTitle>Edge Function URL</VListItemTitle>
          <VListItemSubtitle>
            <code>{{ config.edgeFunctionUrl || 'Not configured' }}</code>
          </VListItemSubtitle>
          <template #append>
            <VIcon 
              :icon="config.edgeFunctionUrl ? 'ri-check-line' : 'ri-close-line'"
              :color="config.edgeFunctionUrl ? 'success' : 'error'"
            />
          </template>
        </VListItem>
        
        <VListItem>
          <VListItemTitle>Survey Flow ID</VListItemTitle>
          <VListItemSubtitle>
            <code>{{ config.surveyFlowId || 'Not configured' }}</code>
          </VListItemSubtitle>
          <template #append>
            <VIcon 
              :icon="config.surveyFlowId ? 'ri-check-line' : 'ri-close-line'"
              :color="config.surveyFlowId ? 'success' : 'error'"
            />
          </template>
        </VListItem>
        
        <VListItem>
          <VListItemTitle>Phone Number ID</VListItemTitle>
          <VListItemSubtitle>
            <code>{{ config.phoneNumberId || 'Not configured (optional)' }}</code>
          </VListItemSubtitle>
          <template #append>
            <VIcon 
              :icon="config.phoneNumberId ? 'ri-check-line' : 'ri-information-line'"
              :color="config.phoneNumberId ? 'success' : 'info'"
            />
          </template>
        </VListItem>
        
        <VListItem>
          <VListItemTitle>Supabase Anon Key</VListItemTitle>
          <VListItemSubtitle>
            <code>{{ config.supabaseAnonKey ? '✓ Configured' : 'Not configured' }}</code>
          </VListItemSubtitle>
          <template #append>
            <VIcon 
              :icon="config.supabaseAnonKey ? 'ri-check-line' : 'ri-close-line'"
              :color="config.supabaseAnonKey ? 'success' : 'error'"
            />
          </template>
        </VListItem>
      </VList>

      <VDivider class="my-4" />

      <div class="d-flex gap-2">
        <VBtn
          color="primary"
          prepend-icon="ri-test-tube-line"
          @click="testConnection"
          :loading="testing"
          :disabled="!configValidation.isValid"
        >
          Test Connection
        </VBtn>
        
        <VBtn
          color="secondary"
          prepend-icon="ri-refresh-line"
          @click="refreshConfig"
          variant="outlined"
        >
          Refresh Config
        </VBtn>
      </div>

      <!-- Test Results -->
      <VAlert
        v-if="testResult"
        :type="testResult.success ? 'success' : 'error'"
        variant="tonal"
        class="mt-4"
      >
        <div class="d-flex align-center">
          <VIcon 
            :icon="testResult.success ? 'ri-check-line' : 'ri-close-line'" 
            class="me-2" 
          />
          {{ testResult.message }}
        </div>
        <div v-if="testResult.details" class="mt-2">
          <small>{{ testResult.details }}</small>
        </div>
      </VAlert>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWhatsAppService } from '../services/whatsappService'

const { config, configValidation } = useWhatsAppService()

const testing = ref(false)
const testResult = ref<{
  success: boolean
  message: string
  details?: string
} | null>(null)

const testConnection = async () => {
  try {
    testing.value = true
    testResult.value = null

    // Test dengan mengirim request ke edge function (tanpa benar-benar mengirim WhatsApp)
    const response = await fetch(`${config.edgeFunctionUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    })

    if (response.ok) {
      testResult.value = {
        success: true,
        message: 'Connection successful!',
        details: 'Edge function is responding and authentication is working.'
      }
    } else {
      const errorData = await response.json()
      testResult.value = {
        success: false,
        message: 'Connection failed',
        details: errorData.message || `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: 'Connection test failed',
      details: error.message || 'Network error or edge function not accessible'
    }
  } finally {
    testing.value = false
  }
}

const refreshConfig = () => {
  // Refresh page untuk memuat ulang environment variables
  window.location.reload()
}

onMounted(() => {
  console.log('WhatsApp Config Status:', {
    isValid: configValidation.isValid,
    missingFields: configValidation.missingFields,
    config: {
      ...config,
      supabaseAnonKey: config.supabaseAnonKey ? '[CONFIGURED]' : '[NOT CONFIGURED]'
    }
  })
})
</script>

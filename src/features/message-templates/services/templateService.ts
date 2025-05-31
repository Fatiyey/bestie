import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { MessageTemplate, CreateTemplatePayload, UpdateTemplatePayload } from '../types'

export function useMessageTemplateService() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTemplates = async (): Promise<{ success: boolean; data: MessageTemplate[]; error?: string }> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return { success: true, data: data || [] }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates'
      error.value = errorMessage
      console.error('Error fetching templates:', err)
      return { success: false, data: [], error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const getTemplateById = async (id: string): Promise<MessageTemplate | null> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template'
      error.value = errorMessage
      console.error('Error fetching template:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (payload: CreateTemplatePayload): Promise<{ success: boolean; data?: MessageTemplate; error?: string }> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('message_templates')
        .insert(payload)
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template'
      error.value = errorMessage
      console.error('Error creating template:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const updateTemplate = async (id: string, payload: UpdateTemplatePayload): Promise<{ success: boolean; data?: MessageTemplate; error?: string }> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('message_templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template'
      error.value = errorMessage
      console.error('Error updating template:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const deleteTemplate = async (id: string): Promise<{ success: boolean; error?: string }> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template'
      error.value = errorMessage
      console.error('Error deleting template:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}

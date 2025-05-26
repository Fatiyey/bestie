import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Visitor, ServiceRequest, ServiceType } from '../types'
import { Console } from 'console'

export const useVisitorService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getVisitors = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_checkins')
        .select(`
          *,
          pst_user:pst_users(
            id,
            name,
            email,
            phone,
            wa_id
          ),
          assigned_user:users(
            id,
            name
          )
        `)
        .order('checkin_time', { ascending: false })

      if (err) throw err
          console.log('Visitors data:', data)
      return data as (Visitor & {
        pst_user: { id: string; name: string; email: string | null; phone: string | null; wa_id: string | null };
        assigned_user: { id: string; name: string } | null;
      })[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getVisitorById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_checkins')
        .select(`
          *,
          pst_user:pst_users(
            id,
            name,
            email,
            phone,
            wa_id
          ),
          assigned_user:users(
            id,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (err) throw err
console.log('Visitor dataID:', data)
      return data as (Visitor & {
        pst_user: { id: string; name: string; email: string | null; phone: string | null; wa_id: string | null };
        assigned_user: { id: string; name: string } | null;
      })
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const getServiceRequests = async (visitorId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_service_requests')
        .select(`
          *,
          service_type:pst_service_types(
            id,
            name,
            description
          ),
          assigned_user:users(
            id,
            name
          )
        `)
        .eq('checkin_id', visitorId)
        .order('created_at', { ascending: false })

      if (err) throw err
console.log('Service requests data:', data)
      return data as (ServiceRequest & {
        service_type: ServiceType;
        assigned_user: { id: string; name: string } | null;
      })[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createServiceRequest = async (request: Partial<ServiceRequest>) => {
    try {
      loading.value = true
      error.value = null

      console.log('Creating service request:', request)

      // Ensure required fields are present
      if (!request.service_type_id) throw new Error('Service type is required')
      if (!request.title) throw new Error('Title is required')
      if (!request.pst_user_id) throw new Error('PST User ID is required for creating a service request')

      const { data, error: err } = await supabase
        .from('pst_service_requests')
        .insert({
          ...request,
          status: 'pending',
          priority: request.priority || 'normal',
        })
        .select(`
          *,
          service_type:pst_service_types(
            id,
            name,
            description
          ),
          assigned_user:users(
            id,
            name
          )
        `)
        .single()

      if (err) {
        console.error('Error creating service request:', err)
        throw err
      }

      console.log('Service request created:', data)
      return data as ServiceRequest & {
        service_type: { id: string; name: string; description: string | null };
        assigned_user: { id: string; name: string } | null;
      }
    } catch (err: any) {
      console.error('Error in createServiceRequest:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateServiceRequest = async (id: string, updates: Partial<ServiceRequest>) => {
    try {
      loading.value = true
      error.value = null

      console.log('Updating service request:', { id, updates })

      const { data, error: err } = await supabase
        .from('pst_service_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          service_type:pst_service_types(
            id,
            name,
            description
          ),
          assigned_user:users(
            id,
            name
          )
        `)
        .single()

      if (err) {
        console.error('Error updating service request:', err)
        throw err
      }

      console.log('Service request updated:', data)
      return data as ServiceRequest & {
        service_type: { id: string; name: string; description: string | null };
        assigned_user: { id: string; name: string } | null;
      }
    } catch (err: any) {
      console.error('Error in updateServiceRequest:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteServiceRequest = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('pst_service_requests')
        .delete()
        .eq('id', id)

      if (err) throw err

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const getServiceTypes = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('pst_service_types')
        .select('*')
        .order('name')

      if (err) throw err

      return data as ServiceType[]
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const updateVisitorStatus = async (id: string, status: Visitor['status'], assignedTo?: string | null) => {
    try {
      loading.value = true
      error.value = null

      const updates: Partial<Visitor> = { status }
      if (assignedTo !== undefined) {
        updates.assigned_to = assignedTo
      }

      const { data, error: err } = await supabase
        .from('pst_checkins')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      return data as Visitor
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getVisitors,
    getVisitorById,
    getServiceRequests,
    createServiceRequest,
    updateServiceRequest,
    deleteServiceRequest,
    getServiceTypes,
    updateVisitorStatus,
  }
}

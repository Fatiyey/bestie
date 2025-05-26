export interface Visitor {
  id: string
  pst_user_id: string
  booking_id: string | null
  checkin_time: string
  queue_number: string
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  assigned_to: string | null
}

export interface ServiceRequest {
  id: string
  pst_user_id: string
  checkin_id: string | null
  booking_id: string | null
  service_type_id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to: string | null
  start_time: string | null
  end_time: string | null
  created_at: string
  updated_at: string
}

export interface SelectedVisitors {
  [key: string]: boolean
}

export interface ServiceType {
  id: string
  name: string
  description: string | null
}

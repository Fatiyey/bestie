export interface User {
  id: string
  email: string | null
  name: string | null
  password_hash: string | null
  created_at: string | null
  role: string | null
  position: string | null
  phone_number: string | null
  is_active: boolean | null
  last_login: string | null
  auth_uid: string | null
}

export interface CreateUserPayload {
  email: string
  name: string
  password: string
  role?: string
  position?: string
  phone_number?: string
}

export interface UpdateUserPayload {
  name?: string
  role?: string
  position?: string
  phone_number?: string
  is_active?: boolean
}

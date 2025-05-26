export interface Member {
  id: string
  name: string
  email: string | null
  phone: string | null
  wa_id: string | null
  contact_id: string | null
  address: string | null
  created_at: string | null
  updated_at: string | null
  birth_year: number | null
  gender: string | null
  education: string | null
  occupation: string | null
  organization: string | null
  service_purpose: string | null
}

export interface SelectedMembers {
  [key: string]: boolean
}

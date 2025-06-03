import type { TipePeriode } from './tipePeriode'

export interface Survei {
  id: number
  nama: string
  tipe_periode: number | null
  is_parent: boolean
  parent_survei_id: number | null
  tipe_periode_data?: TipePeriode
  children?: Survei[] // untuk rincian survei
  parent?: Survei // untuk referensi parent
}

export interface CreateSurveiPayload {
  nama: string
  tipe_periode: number | null
  is_parent?: boolean
  parent_survei_id?: number | null
}

export interface UpdateSurveiPayload {
  nama?: string
  tipe_periode?: number | null
  is_parent?: boolean
  parent_survei_id?: number | null
}

// Interface khusus untuk dropdown/select survei di tabel honor
export interface SurveiForSelection {
  id: number
  nama: string
  display_name: string // "KSA Padi" atau "Survei Sederhana"
  is_parent: boolean
  parent_nama?: string // "Kerangka Sampel Area" untuk "KSA Padi"
}

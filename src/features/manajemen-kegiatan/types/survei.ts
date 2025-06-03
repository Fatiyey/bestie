import type { TipePeriode } from './tipePeriode'

export interface Survei {
  id: number
  nama: string
  tipe_periode: number | null
  tipe_periode_data?: TipePeriode
}

export interface CreateSurveiPayload {
  nama: string
  tipe_periode: number | null
}

export interface UpdateSurveiPayload {
  nama?: string
  tipe_periode?: number | null
}

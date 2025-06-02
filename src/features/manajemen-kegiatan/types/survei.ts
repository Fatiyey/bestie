import type { TipePeriode } from './index'

export interface Survei {
  id: number
  nama: string
  tipe_periode_id: number | null
  tipe_periode?: TipePeriode
}

export interface CreateSurveiPayload {
  nama: string
  tipe_periode_id?: number | null
}

export interface UpdateSurveiPayload {
  nama?: string
  tipe_periode_id?: number | null
}

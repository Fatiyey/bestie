import { TipePeriode } from './tipePeriode'

export interface Periode {
  id: number
  nama_periode: string | null
  tipe_periode_id: number | null
  tipe_periode?: TipePeriode
}

export interface CreatePeriodePayload {
  nama_periode: string
  tipe_periode_id: number | null
}

export interface UpdatePeriodePayload {
  nama_periode?: string
  tipe_periode_id?: number | null
}

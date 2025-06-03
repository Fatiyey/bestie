export interface TipePeriode {
  id: number
  nama_tipe: string
}

export interface CreateTipePeriodePayload {
  nama_tipe: string
}

export interface UpdateTipePeriodePayload {
  nama_tipe?: string
}

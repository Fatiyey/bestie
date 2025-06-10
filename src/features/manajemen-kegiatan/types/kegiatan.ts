import type { Survei } from './survei'

export interface SurveiRinci {
  id: number
  nama_kegiatan: string
  survei_id: number
  survei?: Survei
  kegiatan?: Kegiatan
}

export interface Kegiatan {
  id?: number
  jabatan: string
  jenis_pekerjaan: string
  satuan: string
  honor: number
  is_active?: boolean
}

export interface CreateKegiatanPayload {
  survei_rinci_id: number
  jabatan: string
  jenis_pekerjaan: string
  satuan: string
  honor: number
  is_active?: boolean
}

export interface UpdateKegiatanPayload {
  jabatan?: string
  jenis_pekerjaan?: string
  satuan?: string
  honor?: number
}

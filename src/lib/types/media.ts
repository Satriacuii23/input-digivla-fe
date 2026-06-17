export interface MediaType {
  media_type_id?: number
  media_type_name?: string
  media_type_en?: string
}

export interface Media {
  media_id: number
  media_name: string
  media_type: number  // media_type_id
  type_name?: string
  type_display?: string
  circulation: number | null
  rate_bw: number | null
  rate_fc: number | null
  tier: string | null
  language: string
  status: string
  created_at?: string
}

export interface MediaCreate {
  media_name: string
  media_type: number  // media_type_id
  circulation?: number
  rate_bw?: number
  rate_fc?: number
  tier?: string
  language?: string
  status?: string
}

export interface MediaUpdate {
  media_name?: string
  media_type?: number  // media_type_id
  circulation?: number
  rate_bw?: number
  rate_fc?: number
  tier?: string
  language?: string
  status?: string
}

export interface MediaListResponse {
  data: Media[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

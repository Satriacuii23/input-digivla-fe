export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: 'admin' | 'staff_online' | 'staff_tv_radio' | 'analis' | 'user'
  role_label?: string
  production: string | null
}

export interface Media {
  media_id: number
  media_name: string
  media_type: 'tv' | 'radio' | 'online'
  circulation?: number
  rate_bw?: number
  rate_fc?: number
  address?: string
  email?: string
  phone?: string
  tier?: string
}

export interface Article {
  id?: number
  article_id: number
  media_id: number
  media_name?: string
  title: string
  content?: string
  datee: string
  timee?: string
  journalist?: string
  duration?: number
  filee?: string
  link?: string
  url?: string
  created_at?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: Pagination
  error?: string
}

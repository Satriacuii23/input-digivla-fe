export interface ManagedUser {
  id: number
  username: string
  full_name?: string | null
  email?: string | null
  role: string
  role_label?: string
  production?: string | null
  status: string
  last_login?: string | null
  input_date?: string | null
}

export interface RoleOption {
  value: string
  label: string
}

export interface UserCreatePayload {
  username: string
  password: string
  full_name?: string
  email?: string
  role: string
  production?: string
  status?: 'active' | 'inactive'
}

export interface UserUpdatePayload {
  full_name?: string
  email?: string
  role?: string
  production?: string
  status?: 'active' | 'inactive'
  password?: string
}

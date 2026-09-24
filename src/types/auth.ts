export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

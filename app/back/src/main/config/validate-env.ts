import env from './env'

export const validateEnv = (): void => {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required. Copy .env.example to .env and set a strong local value.')
  }
}

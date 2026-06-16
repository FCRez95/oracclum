export const BACKEND_DEMO_ACCESS_TOKEN = 'backend-demo-access-token'
export const BACKEND_DEMO_EMAIL = 'demo@oracclum.local'
export const BACKEND_DEMO_PASSWORD = 'oracclum-demo'

export const isBackendDemoEnabled = (): boolean => {
  const value = String(process.env.DEMO_MODE_ENABLED ?? '').toLowerCase()
  return ['1', 'true', 'yes', 'on'].includes(value)
}

export const isBackendDemoAccessToken = (accessToken?: string | string[]): boolean => {
  const token = Array.isArray(accessToken) ? accessToken[0] : accessToken
  return isBackendDemoEnabled() && token === BACKEND_DEMO_ACCESS_TOKEN
}

export const isBackendDemoLogin = (email?: string, password?: string): boolean => {
  return isBackendDemoEnabled() && email === BACKEND_DEMO_EMAIL && password === BACKEND_DEMO_PASSWORD
}

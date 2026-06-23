export type ClickAuthApiConfig = {
  defaultBaseUrl: string
  metaBaseUrl: string
  adminToken?: string
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

export const normalizeClickAuthApiConfig = (config: ClickAuthApiConfig): ClickAuthApiConfig => ({
  defaultBaseUrl: trimTrailingSlash(config.defaultBaseUrl),
  metaBaseUrl: trimTrailingSlash(config.metaBaseUrl || config.defaultBaseUrl),
  adminToken: config.adminToken || ''
})

export const getClickAuthApiBaseUrl = (ad_provider: string, config: ClickAuthApiConfig): string => {
  if (ad_provider === 'meta') {
    return config.metaBaseUrl
  }

  return config.defaultBaseUrl
}

export const clickAuthHeaders = (adminToken = ''): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`
  }

  return headers
}

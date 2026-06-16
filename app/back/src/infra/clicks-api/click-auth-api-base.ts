export const getClickAuthApiBaseUrl = (ad_provider: string): string => {
  if (ad_provider === 'meta') {
    return 'https://clicks-meta.oracclum.com/admin/clickauth'
  }

  return 'https://clicks-api.oracclum.com/admin/clickauth'
}

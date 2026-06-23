import { RemoveClickAuth } from '../../data/protocols/external-apis/remove-click-auth'
import { ClickAuthApiConfig, clickAuthHeaders, getClickAuthApiBaseUrl, normalizeClickAuthApiConfig } from './click-auth-api-base'

export class RemoveClickAuthApi implements RemoveClickAuth {
  private readonly config: ClickAuthApiConfig

  constructor (config: ClickAuthApiConfig) {
    this.config = normalizeClickAuthApiConfig(config)
  }

  async remove (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
    const response = await fetch(`${getClickAuthApiBaseUrl(ad_provider, this.config)}/${click_auth}`, {
      method: 'DELETE',
      headers: clickAuthHeaders(this.config.adminToken),
    })
    if (!response.ok) {
      throw new Error('Failed to remove click auth')
    }
  }
}

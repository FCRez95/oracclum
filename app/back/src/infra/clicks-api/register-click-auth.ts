import { RegisterClickAuth } from '../../data/protocols/external-apis/clicks-api'
import { ClickAuthApiConfig, clickAuthHeaders, getClickAuthApiBaseUrl, normalizeClickAuthApiConfig } from './click-auth-api-base'

export class RegisterClickAuthApi implements RegisterClickAuth {
  private readonly config: ClickAuthApiConfig

  constructor (config: ClickAuthApiConfig) {
    this.config = normalizeClickAuthApiConfig(config)
  }

  async register (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
    const response = await fetch(getClickAuthApiBaseUrl(ad_provider, this.config), {
      method: 'PUT',
      headers: clickAuthHeaders(this.config.adminToken),
      body: JSON.stringify({
        token: click_auth,
        campaign_id: campaign_id.toString(),
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to register click auth')
    }
  }
}

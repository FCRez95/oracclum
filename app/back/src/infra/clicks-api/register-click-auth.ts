import { RegisterClickAuth } from '../../data/protocols/external-apis/clicks-api'
import { getClickAuthApiBaseUrl } from './click-auth-api-base'

export class RegisterClickAuthApi implements RegisterClickAuth {
  async register (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
      const response = await fetch(getClickAuthApiBaseUrl(ad_provider), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token:click_auth,
        campaign_id: campaign_id.toString(),
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to register click auth')
    }
  }
}

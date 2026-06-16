import { RemoveClickAuth } from '../../data/protocols/external-apis/remove-click-auth'
import { getClickAuthApiBaseUrl } from './click-auth-api-base'

export class RemoveClickAuthApi implements RemoveClickAuth {
  async remove (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
    const response = await fetch(`${getClickAuthApiBaseUrl(ad_provider)}/${click_auth}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to remove click auth')
    }
  }
}

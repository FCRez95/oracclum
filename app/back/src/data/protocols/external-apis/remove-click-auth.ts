export interface RemoveClickAuth {
  remove (click_auth: string, campaign_id: number, ad_provider: string): Promise<void>
}

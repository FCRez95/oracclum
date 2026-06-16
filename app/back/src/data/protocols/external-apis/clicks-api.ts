export interface RegisterClickAuth {
  register (click_auth: string, campaign_id: number, ad_provider: string): Promise<void>
}

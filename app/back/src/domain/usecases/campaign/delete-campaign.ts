export interface DeleteCampaign {
  delete (id_user: number, id_campaign: number): Promise<void | null>
}

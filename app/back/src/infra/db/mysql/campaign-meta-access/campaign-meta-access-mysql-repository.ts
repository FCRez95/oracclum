import { Pool } from "mysql2"
import { LoadCampaignMetaAccessRepository, CampaignMetaAccessRow } from "../../../../data/protocols/db/campaign-meta-access/load-campaign-meta-access-repository"
import { SaveCampaignMetaAccessRepository } from "../../../../data/protocols/db/campaign-meta-access/save-campaign-meta-access-repository"
import { getOne, runQuery } from "../mysql-helper"

export class CampaignMetaAccessMySqlRepository implements LoadCampaignMetaAccessRepository, SaveCampaignMetaAccessRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async loadByCampaignId (idCampaign: number): Promise<CampaignMetaAccessRow | null> {
    const result = await getOne(this.connectionPool, 'campaign_meta_access', 'id_campaign', idCampaign)
    return result[0] || null
  }

  async save (pixelInfo: CampaignMetaAccessRow): Promise<void> {
    const query = `
      INSERT INTO campaign_meta_access (id_campaign, access_token, pixel_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        access_token = VALUES(access_token),
        pixel_id = VALUES(pixel_id)
    `

    await runQuery(this.connectionPool, query, [
      pixelInfo.id_campaign,
      pixelInfo.access_token,
      pixelInfo.pixel_id
    ])
  }
}

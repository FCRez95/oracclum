import { CampaignModel } from '../../../../domain/models/campaign'
import { deleteById, getOne, insertOne, runQuery, updateById } from '../mysql-helper'
import { mapCreatedCampaign } from './campaign-mysql-repository-helper'
import { Pool } from 'mysql2'
import { AddCampaignRepository } from '../../../../data/usecases/add-campaign/db-add-campaign-protocols'
import { LoadUserCampaignsRepository } from '../../../../data/protocols/db/campaign/load-user-campaigns-repository'
import { LoadCampaignRepository } from '../../../../data/protocols/db/campaign/load-campaign'
import { DeleteCampaignRepository } from '../../../../data/protocols/db/campaign/delete-campaign-repository'
import { EditCampaignRepository, EditCampaignLinkRepository } from '../../../../data/protocols/db/campaign/edit-campaign-repository'
import { EditCampaignData } from '../../../../domain/usecases/campaign/edit-campaign'

export class CampaignMySqlRepository implements AddCampaignRepository, LoadUserCampaignsRepository, LoadCampaignRepository,
  DeleteCampaignRepository, EditCampaignRepository, EditCampaignLinkRepository {
  public readonly connectionPool: Pool

  constructor(pool: Pool) {
    this.connectionPool = pool
  }

  async add(name: string, link: string, idUser: number, clickAuth: string, ad_provider: string, conversion_name: string, checkout_provider: string, external_id: string, sub_account?: string): Promise<CampaignModel> {
    const insertCampaign = {
      id_user: idUser,
      name: name,
      link: link,
      click_auth: clickAuth,
      ad_provider: ad_provider,
      conversion_name: conversion_name,
      checkout_provider: checkout_provider,
      sub_account: sub_account ? sub_account : null,
      external_id: external_id
    }
    const result = await insertOne(this.connectionPool, 'campaigns', insertCampaign)
    return mapCreatedCampaign(insertCampaign, result.insertId)
  }

  async delete(id_campaign: number): Promise<void> {
    await deleteById(this.connectionPool, "campaigns", "id", id_campaign);
  }

  async loadCampaign(id_campaign: number): Promise<CampaignModel> {
    const result = await getOne(
      this.connectionPool,
      "campaigns",
      "id",
      id_campaign
    );
    return result[0];
  }

  async loadUserCampaigns(idUser: number): Promise<CampaignModel[]> {
    return await runQuery(this.connectionPool, 'SELECT * FROM campaigns WHERE id_user = ?', [idUser])
  }

  async editCampaign(id: number, data: EditCampaignData): Promise<any> {
    try {
      const query = `UPDATE campaigns SET name=?, link=?, ad_provider=?, conversion_name=?, checkout_provider=?, external_id=?, sub_account=? WHERE id=?`
      return await runQuery(this.connectionPool, query, [data.name, data.link, data.ad_provider, data.conversion_name, data.checkout_provider, data.external_id, data.sub_account ?? null, id])
    } catch (err) {
      throw err
    }
  }
  async editCampaignLink(id: number, new_link: string): Promise<any> {

    try {
      return await updateById(this.connectionPool, 'campaigns', 'link', id, new_link)
    } catch (err) {
      throw err
    }
  }

  async updateExternalIds(updates: Array<{ id_campaign: number; external_id: string | number }>): Promise<void> {
    if (!updates.length) return
    const cases = updates.map(() => 'WHEN ? THEN ?').join(' ')
    const ids = updates.map(() => '?').join(',')
    const caseParams = updates.flatMap(update => [update.id_campaign, update.external_id])
    const idParams = updates.map(update => update.id_campaign)
    const query = `UPDATE campaigns SET external_id = CASE id ${cases} END WHERE id IN (${ids})`
    await runQuery(this.connectionPool, query, [...caseParams, ...idParams])
  }
}

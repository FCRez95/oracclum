1/* eslint-disable no-undef */
import { ClickMysqlRepository } from './clicks-mysql-repository'
import env from '../../../../main/config/env'
import { connection } from '../../../../main/config/app'
import mysql from 'mysql2'
import { insertOne } from '../mysql-helper'

describe('Clicks Mysql Repository', () => {
  afterAll(async () => {
    connection.end()
    testConnection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const sut = new ClickMysqlRepository(testConnection)

  test('Should return OptimizationData on load success with id_campaign', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      link: 'any_link',
      ad_provider: 'taboola',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })

    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_25', 
	    id_campaign: campaign.insertId,
			step_1: 1,
			step_2: 1,
			step_3: 1,
			checkout: 1,
			revenue: 10.0

    })
    const campaignOptimizationData = await sut.load(0, campaign.insertId)
		expect(campaignOptimizationData).toBeTruthy()
    expect(campaignOptimizationData.revenue).toBe(10)
		expect(campaignOptimizationData.checkout).toBe(1)
		expect(campaignOptimizationData.sales).toBe(1)
  })

  test('Should return OptimizationData on load success with id_ads', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })

    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_26', 
	    id_campaign: campaign.insertId,
      id_ads_taboola: 3000,
			step_1: 1,
			step_2: 1,
			step_3: 1,
			checkout: 1,
			revenue: 10.0

    })
    const campaignOptimizationData = await sut.load(0, undefined, 3000)
		expect(campaignOptimizationData).toBeTruthy()
    expect(campaignOptimizationData.revenue).toBe(10)
		expect(campaignOptimizationData.checkout).toBe(1)
		expect(campaignOptimizationData.sales).toBe(1)
  })

  test('Should return OptimizationData on load success with id_site and id_funnels', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail99@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })
    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_27', 
	    id_campaign: campaign.insertId,
      id_campaign_taboola: 1,
      id_ads_taboola: 281095,
      id_site: 'any_id',
      site: 'any_site',
			step_1: 1,
			step_2: 1,
			step_3: 1,
			checkout: 1,
			revenue: 10.0
    })

    const campaignSitesOptimizationData = await sut.load(0, campaign.insertId, undefined, 'any_id')
		expect(campaignSitesOptimizationData).toBeTruthy()
    expect(campaignSitesOptimizationData.revenue).toBe(10)
		expect(campaignSitesOptimizationData.checkout).toBe(1)
		expect(campaignSitesOptimizationData.sales).toBe(1)
  })

  test('Should return id_campaign_taboola on getTaboolaId success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })
    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click', 
	    id_campaign: campaign.insertId,
      id_campaign_taboola: 1,
      thumbnail: 'any_thumb',
      title: 'any_title',
			step_1: 1,
			step_2: 1,
			step_3: 1,
			checkout: 1,
			revenue: 10.0

    })
    const id = await sut.getTaboolaId(campaign.insertId)
		expect(id).toBeTruthy()
		expect(id).toBe("1")
  })

  test('Should return summaries for multiple campaigns on loadSummariesByCampaignIds', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'campaigns@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaignOne = await insertOne(testConnection, 'campaigns', {
      name: 'campaign_one',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })
    const campaignTwo = await insertOne(testConnection, 'campaigns', {
      name: 'campaign_two',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })

    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_bulk_1',
      id_campaign: campaignOne.insertId,
      checkout: 1,
      revenue: 10.0
    })
    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_bulk_2',
      id_campaign: campaignTwo.insertId,
      checkout: 1,
      revenue: 5.0
    })

    const summaries = await sut.loadSummariesByCampaignIds('taboola', [campaignOne.insertId, campaignTwo.insertId], 0)
    const summaryByCampaignId = new Map(summaries.map((row) => [row.id_campaign, row]))
    expect(summaryByCampaignId.get(campaignOne.insertId)?.revenue).toBe(10)
    expect(summaryByCampaignId.get(campaignTwo.insertId)?.revenue).toBe(5)
  })

  test('Should return site summaries for a campaign on loadSitesSummariesByCampaignAndIds', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'sites@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'campaign_sites',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })
    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click_site_bulk',
      id_campaign: campaign.insertId,
      id_site: 'site-1',
      checkout: 1,
      revenue: 12.0
    })

    const summaries = await sut.loadSitesSummariesByCampaignAndIds(0, campaign.insertId, ['site-1'])
    expect(summaries[0].id_site).toBe('site-1')
    expect(summaries[0].revenue).toBe(12)
    expect(summaries[0].checkout).toBe(1)
  })

})

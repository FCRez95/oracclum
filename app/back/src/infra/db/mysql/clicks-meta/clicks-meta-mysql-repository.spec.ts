1/* eslint-disable no-undef */
import { ClickMetaMysqlRepository } from './clicks-meta-mysql-repository'
import env from '../../../../main/config/env'
import { connection } from '../../../../main/config/app'
import mysql from 'mysql2'
import { getOne, insertOne } from '../mysql-helper'

describe('Clicks Mysql Repository', () => {
  afterAll(async () => {
    connection.end()
    testConnection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const sut = new ClickMetaMysqlRepository(testConnection)

  test('Should return id_meta on getMetaId success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      link: 'any_link',
      id_user: user.insertId,
      ad_provider: 'meta',
      click_auth: 'click_auth',
    })
    await insertOne(testConnection, 'clicks_meta', {
      id_click: 'any_click', 
	    id_campaign: campaign.insertId,
      id_campaign_meta: 'id_meta'
    })
    const id = await sut.getMetaId(campaign.insertId)
		expect(id).toBeTruthy()
		expect(id).toBe('id_meta')
  })

  test('Should return OptimizationData on loadCampaignOptData success with id_campaign', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      link: 'any_link',
      ad_provider: 'meta',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })

    await insertOne(testConnection, 'clicks_meta', {
      id_click: 'any_click_32', 
	    id_campaign: campaign.insertId,
			checkout: 1,
			revenue: 10.0
    })
    const campaignOptimizationData = await sut.loadCampaignOptData(campaign.insertId, 0)
		expect(campaignOptimizationData).toBeTruthy()
    expect(campaignOptimizationData.revenue).toBe(10)
		expect(campaignOptimizationData.checkout).toBe(1)
		expect(campaignOptimizationData.sales).toBe(1)
  })

  test('Should return InternalOptimizationData on loadAdsetOptData success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await insertOne(testConnection, 'campaigns', {
      name: 'any_name',
      link: 'any_link',
      ad_provider: 'meta',
      id_user: user.insertId,
      click_auth: 'click_auth',
    })

    await insertOne(testConnection, 'clicks_meta', {
      id_click: 'any_click_34',
      id_ad_set: 1,
	    id_campaign: campaign.insertId,
			checkout: 1,
			revenue: 10.0

    })
    const adSetOptimizationData = await sut.loadAdsetOptData(1, 0)
    expect(adSetOptimizationData).toBeTruthy()
    expect(adSetOptimizationData.revenue).toBe(10.0)
    expect(adSetOptimizationData.checkout).toBe(1)
    expect(adSetOptimizationData.sales).toBe(1)
  })
})
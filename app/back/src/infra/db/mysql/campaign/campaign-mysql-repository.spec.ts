/* eslint-disable no-undef */
import { CampaignMySqlRepository } from './campaign-mysql-repository'
import env from '../../../../main/config/env'
import { connection } from '../../../../main/config/app'
import mysql from 'mysql2'
import { insertOne, getOne } from '../mysql-helper'

describe('Campaign Mysql Repository', () => {
  afterAll(async () => {
    connection.end()
    testConnection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const sut = new CampaignMySqlRepository(testConnection)

  test('Should return an campaign on add success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')
    expect(campaign).toBeTruthy()
    expect(campaign.id).toBeTruthy()
    expect(campaign.name).toBe('any_name')
    expect(campaign.id_user).toBe(user.insertId)
    expect(campaign.click_auth).toBe('click_auth')
  })

  test('Should delete campaign and its records on delete success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'taboola')

    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      revenue: 15.0,
    })
    const click = await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      revenue: 10.0,
    })
    await sut.delete(campaign.id)

    const tryCampaign = await getOne(testConnection, 'campaigns', 'id', campaign.id)
    const tryClick = await getOne(testConnection, 'clicks_taboola', 'id', click.insertId)
    expect(tryCampaign.length).toBe(0)
    expect(tryClick.length).toBe(0)
  })

  test('Should return a campaign[] on loadUserCampaigns success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')
    const campaigns = await sut.loadUserCampaigns(user.insertId)
    expect(campaigns[0]).toBeTruthy()
    expect(campaigns[0].id).toBeTruthy()
    expect(campaigns[0].name).toBe('any_name')
    expect(campaigns[0].id_user).toBe(user.insertId)
    expect(campaigns[0].click_auth).toBe('click_auth')
  })

  test('Should return a campaignData on loadSummary success - Taboola Campaign', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')

    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      revenue: 15.0,
    })
    await insertOne(testConnection, 'clicks_taboola', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      revenue: 10.0,
    })
    const campaignData = await sut.loadSummary(campaign.id, 'taboola', 500)
    expect(campaignData).toBeTruthy()
    expect(campaignData.revenue).toBe(25)
    expect(campaignData.sales).toBe(2)
    expect(campaignData.checkout).toBe(0)
  })

  test('Should return a campaignData on loadSummary success - Meta Campaign', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'meta')

    await insertOne(testConnection, 'clicks_meta', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      checkout: 1,
      revenue: 15.0,
    })
    await insertOne(testConnection, 'clicks_meta', {
      id_click: 'any_click',
      id_campaign: campaign.id,
      checkout: 1,
      revenue: 10.0,
    })
    const campaignData = await sut.loadSummary(campaign.id, 'meta', 500)
    expect(campaignData).toBeTruthy()
    expect(campaignData.revenue).toBe(25)
    expect(campaignData.sales).toBe(2)
    expect(campaignData.checkout).toBe(2)
  })

  test('Should return a campaign on loadCampaign success', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')

    const loadCampaign = await sut.loadCampaign(campaign.id)
    expect(loadCampaign).toBeTruthy()
    expect(loadCampaign.id).toBeTruthy()
    expect(loadCampaign.name).toBe('any_name')
    expect(loadCampaign.click_auth).toBe('click_auth')
    expect(loadCampaign.id_user).toBe(user.insertId)
  })

  test('should edit campaign', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')
    const loadCampaign = await sut.loadCampaign(campaign.id)
    const newName = 'new_name'
    const updateCampaign = await sut.editCampaign(loadCampaign.id, newName)
    const newCampaign = await sut.loadCampaign(loadCampaign.id)

    expect(updateCampaign).toBeTruthy()
    expect(newCampaign.name).toEqual(newName)
  })
  test('should edit campaign link', async () => {
    const user = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const campaign = await sut.add('any_name', 'any_link', user.insertId, 'click_auth', 'any_provider')
    const loadCampaign = await sut.loadCampaign(campaign.id)
    const newLink = 'new_link'
    const updateCampaign = await sut.editCampaignLink(loadCampaign.id, newLink)
    const newCampaign = await sut.loadCampaign(loadCampaign.id)

    expect(updateCampaign).toBeTruthy()
    expect(newCampaign.link).toEqual(newLink)
  })
})

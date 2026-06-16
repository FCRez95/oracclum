/* eslint-disable no-undef */
import express from 'express'
import request from 'supertest'
import { connection } from '../config/app'
import setUpRoutes from '../config/routes'
import setUpMiddlewares from '../config/middlewares'
import env from '../config/env'
import mysql from 'mysql2'
import { insertOne, updateById } from '../../infra/db/mysql/mysql-helper'
import { sign } from 'jsonwebtoken'

describe('Campaign Routes', () => {
  afterAll(() => {
    testConnection.end()
    connection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const app1 = express()
  setUpMiddlewares(app1)
  setUpRoutes(app1, testConnection)

  describe('POST - /add-campaign', () => {
    test('Should return 200 on signup success', async () => {
      const result = await insertOne(testConnection, 'Users', {
        name: 'valid_name',
        email: 'mail5@mail.com',
        password: 'valid5_password',
        user_type: 'cli',
      })
      const id = result.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      await updateById(testConnection, 'Users', 'access_token', id, accessToken)

      await request(app1)
        .post('/api/add-campaign')
        .set('x-access-token', accessToken)
        .send({
          name: 'any_name',
          link: 'any_link',
          ad_provider: 'any_provider',
          sub_account: 'sub_conta'
        })
        .expect(200)
    })
  })

  describe('GET - /delete-campaign', () => {
    test('Should return 200 on load ads summary success', async () => {
      const user = await insertOne(testConnection, 'Users', {
        name: 'any_name',
        email: 'any_mail@email.com',
        password: 'any_password',
        user_type: 'any_role'
      })
      const id = user.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      await updateById(testConnection, 'Users', 'access_token', id, accessToken)

      const campaign = await insertOne(testConnection, 'campaigns', {
        name: 'any_name',
        link: 'any_link',
        id_user: user.insertId,
        click_auth: 'click_auth',
      })

      await insertOne(testConnection, 'clicks_taboola', {
        id_click: 'any_click',
        id_campaign: campaign.insertId,
        id_ads_taboola: 222,
        id_site: 'any_id',
        site: 'any_site',
        step_1: 1,
        step_2: 1,
        step_3: 1,
        checkout: 1,
        revenue: 10.0
      })

      await request(app1)
        .post(`/api/delete-campaign`)
        .set('x-access-token', accessToken)
        .send({
          idCampaign: campaign.insertId
        })
        .expect(200)
    })
  })
  describe('PATCH - /edit-campaign', () => {
    test('Should return 200 on edit campaign success', async () => {
      const user = await insertOne(testConnection, 'Users', {
        name: 'any_name',
        email: 'any_mail@email.com',
        password: 'any_password',
        user_type: 'any_role'
      })
      const id = user.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      await updateById(testConnection, 'Users', 'access_token', id, accessToken)

      const campaign = await insertOne(testConnection, 'campaigns', {
        name: 'any_name',
        link: 'any_link',
        id_user: user.insertId,
        click_auth: 'click_auth',
      })

      await insertOne(testConnection, 'clicks_taboola', {
        id_click: 'any_click',
        id_campaign: campaign.insertId,
        id_ads_taboola: 222,
        id_site: 'any_id',
        site: 'any_site',
        step_1: 1,
        step_2: 1,
        step_3: 1,
        checkout: 1,
        revenue: 10.0
      })

      await request(app1)
        .post(`/api/edit-campaign`)
        .set('x-access-token', accessToken)
        .send({
          idCampaign: campaign.insertId,
          new_name: "new_name",
          id_user: user.insertId,
        })
        .expect(200)
    })
    describe('PATCH - /edit-campaign-link', () => {
      test('Should return 200 on edit campaign link success', async () => {
        const user = await insertOne(testConnection, 'Users', {
          name: 'any_name',
          email: 'any_mail@email.com',
          password: 'any_password',
          user_type: 'any_role'
        })
        const id = user.insertId
        const accessToken = sign({ id }, env.jwtSecret)
        await updateById(testConnection, 'Users', 'access_token', id, accessToken)

        const campaign = await insertOne(testConnection, 'campaigns', {
          name: 'any_name',
          link: 'any_link',
          id_user: user.insertId,
          click_auth: 'click_auth',
        })

        await insertOne(testConnection, 'clicks_taboola', {
          id_click: 'any_click',
          id_campaign: campaign.insertId,
          id_ads_taboola: 222,
          id_site: 'any_id',
          site: 'any_site',
          step_1: 1,
          step_2: 1,
          step_3: 1,
          checkout: 1,
          revenue: 10.0
        })

        await request(app1)
          .post(`/api/edit-campaign-link`)
          .set('x-access-token', accessToken)
          .send({
            idCampaign: campaign.insertId,
            new_link: "new_link",
            id_user: user.insertId,
          })
          .expect(200)
      })
    })
  })
})

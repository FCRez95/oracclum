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

describe('Account Routes', () => {
  afterAll(() => {
    testConnection.end()
    connection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const app1 = express()
  setUpMiddlewares(app1)
  setUpRoutes(app1, testConnection)

  describe('POST - /signup', () => {
    test('Should return 200 on signup success', async () => {
      await request(app1)
        .post('/api/signup')
        .send({
          name: 'fabio',
          email: 'fabio5@email.com',
          password: 'fabio123',
          passwordConfirmation: 'fabio123'
        })
        .expect(200)
    })
  })

  describe('POST - /login', () => {
    test('Should return 200 on login success', async () => {
      await request(app1)
        .post('/api/signup')
        .send({
          name: 'any_name',
          email: 'valid_mail@email.com',
          password: 'valid_password',
          passwordConfirmation: 'valid_password'
        })
      await request(app1)
        .post('/api/login')
        .send({
          email: 'valid_mail@email.com',
          password: 'valid_password'
        })
        .expect(200)
    })

    test('Should return 401 if login fails', async () => {
      await request(app1)
        .post('/api/login')
        .send({
          email: 'invalid@email.com',
          password: 'invalid_password'
        })
        .expect(401)
    })
  })

  describe('POST - /logout', () => {
    test('Should return 200 on logout success', async () => {
      const result = await insertOne(testConnection, 'Users', {
        name: 'valid_name',
        email: 'mail10@mail.com',
        password: 'valid5_password',
        user_type: 'cli',
      })
      const id = result.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      const data = await updateById(testConnection, 'Users', 'access_token', id, accessToken)
      await request(app1)
        .post('/api/logout')
        .set('x-access-token', accessToken)
        .send({
          accessToken: accessToken
        })
        .expect(200)
    })
  })

  describe('POST - /change-pass', () => {
    test('Should return 200 on change pass success', async () => {
      const result = await insertOne(testConnection, 'Users', {
        name: 'valid_name',
        email: 'mail3333@mail.com',
        password: 'valid5_password',
        user_type: 'cli',
      })
      const id = result.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      const data = await updateById(testConnection, 'Users', 'access_token', id, accessToken)
      await request(app1)
        .post('/api/change-pass')
        .set('x-access-token', accessToken)
        .send({
          newPass: 'any_pass'
        })
        .expect(200)
    })
  })

  describe('POST - /add-taboola-info', () => {
    test('Should return 200 on add taboola info success', async () => {
      const result = await insertOne(testConnection, 'Users', {
        name: 'valid_name',
        email: 'mail3333@mail.com',
        password: 'valid5_password',
        user_type: 'cli',
      })
      const id = result.insertId
      const accessToken = sign({ id }, env.jwtSecret)
      await updateById(testConnection, 'Users', 'access_token', id, accessToken)

      await request(app1)
        .post('/api/add-taboola-info')
        .set('x-access-token', accessToken)
        .send({
          accountId: 'any_account',
          clientId: 'any_client',
          clientSecret: 'any_secret'
        })
        .expect(200)
    })
  })
})

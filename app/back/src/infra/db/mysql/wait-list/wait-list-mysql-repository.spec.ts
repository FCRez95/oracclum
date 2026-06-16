/* eslint-disable no-undef */
import { WaitListMysqlRepository } from './wait-list-mysql-repository'
import env from '../../../../main/config/env'
import { connection } from '../../../../main/config/app'
import mysql from 'mysql2'
import { insertOne, getOne } from '../mysql-helper'

describe('Account Mysql Repository', () => {
  afterAll(async () => {
    connection.end()
    testConnection.end()
  })

  const testConnection = mysql.createPool(env.dbTest)
  const sut = new WaitListMysqlRepository(testConnection)

  describe('check function', () => {
    test('Should return an account on check success', async () => {
        await insertOne(testConnection, 'wait_list', {
          name: 'any_name',
          email: 'any_mail@email.com',
          cel: 'any_cel',
        })
        const loadedClient = await sut.check('any_mail@email.com')
        expect(loadedClient).toBeTruthy()
        expect(loadedClient.id).toBeTruthy()
        expect(loadedClient.name).toBe('any_name')
        expect(loadedClient.email).toBe('any_mail@email.com')
        expect(loadedClient.cel).toBe('any_cel')
      })
    
      test('Should return null if check fails', async () => {
        const loadedClient = await sut.check('invalid_mail@email.com')
        expect(loadedClient).toBeFalsy()
      })
  })

  describe('add function', () => {
    test('Should return a new client on add success', async () => {
        const client = await sut.add({
          name: 'any_name',
          email: 'any_mail@email.com',
          cel: 'any_cel'
        })
        expect(client).toBeTruthy()
        expect(client.id).toBeTruthy()
        expect(client.name).toBe('any_name')
        expect(client.email).toBe('any_mail@email.com')
        expect(client.cel).toBe('any_cel')
      })
  })
})

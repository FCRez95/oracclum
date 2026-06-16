/* eslint-disable no-undef */
import { LogMysqlRepository } from './log-mysql-repository'
import { connection } from '../../../../main/config/app'
import env from '../../../../main/config/env'
import mysql from 'mysql2'
import { getCount } from '../mysql-helper'

describe('Log Mysql Repository', () => {
  afterAll(() => {
    connection.end()
    sut.connectionPool.end()
  })
  const testConnection = mysql.createPool(env.dbTest)
  const sut = new LogMysqlRepository(testConnection)

  test('Should create a log error on success', async () => {
    await sut.logError('any_error')
    const count = await getCount(testConnection, 'logs')
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

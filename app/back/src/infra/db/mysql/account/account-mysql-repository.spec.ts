/* eslint-disable no-undef */
import { AccountMySqlRepository } from './account-mysql-repository'
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
  const sut = new AccountMySqlRepository(testConnection)

  test('Should return an account on add success', async () => {
    const account = await sut.add({
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('any_name')
    expect(account.email).toBe('any_mail@email.com')
    expect(account.password).toBe('any_password')
  })

  test('Should update the password on changePassword success', async () => {
    const us = await insertOne(testConnection, 'Users', {
      name: 'token_name',
      email: 'token_mail33@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })
    await sut.changePassword(us.insertId, 'hashed_pass')
    const updatedAccount = await getOne(testConnection, 'Users', 'email', 'token_mail33@email.com')
    expect(updatedAccount[0].password).toBe('hashed_pass')
  })

  test('Should return an account on loadByEmail success', async () => {
    await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role'
    })
    const loadedAccount = await sut.loadByEmail('any_mail@email.com')
    expect(loadedAccount).toBeTruthy()
    expect(loadedAccount.id).toBeTruthy()
    expect(loadedAccount.name).toBe('any_name')
    expect(loadedAccount.email).toBe('any_mail@email.com')
    expect(loadedAccount.password).toBe('any_password')
  })

  test('Should return null if loadByEmail fails', async () => {
    const loadedAccount = await sut.loadByEmail('invalid_mail@email.com')
    expect(loadedAccount).toBeFalsy()
  })

  test('Should update the account accessToken with updateAccessToken success', async () => {
    const us = await insertOne(testConnection, 'Users', {
      name: 'token_name',
      email: 'token_mail@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })

    const createdAccount = await getOne(testConnection, 'Users', 'email', 'token_mail@email.com')
    expect(createdAccount[0].accessToken).toBeFalsy()
    await sut.updateAccessToken(createdAccount[0].id, 'generated_token')
    const updatedAccount = await getOne(testConnection, 'Users', 'email', 'token_mail@email.com')
    expect(updatedAccount[0].access_token).toBe('generated_token')
  })

  test('Should return an account on loadByToken success without role', async () => {
    await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      user_type: 'any_role',
      access_token: 'any_tokenn1'
    })

    const loadedAccount = await sut.loadByToken('any_tokenn1')
    expect(loadedAccount).toBeTruthy()
    expect(loadedAccount.id).toBeTruthy()
    expect(loadedAccount.name).toBe('any_name')
    expect(loadedAccount.email).toBe('any_mail@email.com')
    expect(loadedAccount.password).toBe('any_password')
  })

  test('Should return null on loadByToken with role different from userType', async () => {
    await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      access_token: 'any_token',
      user_type: 'any_role'
    })

    const loadedAccount = await sut.loadByToken('any_token', 'admin')
    expect(loadedAccount).toBeNull()
  })

  test('Should return an account on loadByToken success with role', async () => {
    const us = await insertOne(testConnection, 'Users', {
      name: 'any_name',
      email: 'any_mail@email.com',
      password: 'any_password',
      access_token: 'token_testingss',
      user_type: 'role'
    })
    const loadedAccount = await sut.loadByToken('token_testingss', 'role')
    expect(loadedAccount).toBeTruthy()
    expect(loadedAccount.id).toBeTruthy()
    expect(loadedAccount.name).toBe('any_name')
    expect(loadedAccount.email).toBe('any_mail@email.com')
    expect(loadedAccount.password).toBe('any_password')
    expect(loadedAccount.user_type).toBe('role')
  })

  test('Should update the account taboola_info with addTaboolaInfo success', async () => {
    const us = await insertOne(testConnection, 'Users', {
      name: 'token_name',
      email: 'token_mail@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })

    const createdAccount = await getOne(testConnection, 'Users', 'email', 'token_mail@email.com')
    expect(createdAccount[0].taboola_info).toBeFalsy()
    await sut.addTaboolaInfo(createdAccount[0].id, 'encrypted_info')
    const updatedAccount = await getOne(testConnection, 'Users', 'email', 'token_mail@email.com')
    expect(updatedAccount[0].taboola_info).toBe('encrypted_info')
  })

  test('Should return all accounts on LoadAccounts success', async () => {
    await insertOne(testConnection, 'Users', {
      name: 'all_accounts1',
      email: 'all_accounts1@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })

    await insertOne(testConnection, 'Users', {
      name: 'all_accounts2',
      email: 'all_accounts2@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })

    await insertOne(testConnection, 'Users', {
      name: 'all_accounts3',
      email: 'all_accounts3@email.com',
      password: 'token_password',
      user_type: 'any_role'
    })

    const allAcc = await sut.loadAccounts()
    expect(allAcc).toBeTruthy()
    expect(allAcc.length).toBeGreaterThan(2)
  })
})

import { AccessDeniedError } from '../../../presentation/errors'
import {
    LoadAccountByTokenRepository,
    UpdateAccessTokenRepository,
    AccountModel,
    Logout
  } from './db-logout-protocols'
  
  export class DbLogout implements Logout {
    private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository

    constructor (loadAccountByTokenRepository: LoadAccountByTokenRepository, updateAccessTokenRepository: UpdateAccessTokenRepository) {
      this.loadAccountByTokenRepository = loadAccountByTokenRepository
      this.updateAccessTokenRepository = updateAccessTokenRepository
    }
  
    async logout (id_user:number, access_token: string) {
      const account: AccountModel = await this.loadAccountByTokenRepository.loadByToken(access_token)

      await this.updateAccessTokenRepository.updateAccessToken(id_user, null)
      return null
    }
  }
  
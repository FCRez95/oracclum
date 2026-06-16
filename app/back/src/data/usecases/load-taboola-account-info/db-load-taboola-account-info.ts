import { TaboolaAccountInfoModel } from "../../../domain/models/taboola-account-info";
import { LoadTaboolaAccountInfo } from "../../../domain/usecases/account/load-taboola-account-info";
import { Decrypter } from "../../protocols/criptography/decrypter";
import { LoadAccountByTokenRepository } from "../logout/db-logout-protocols";

export class DbLoadTaboolaAccountInfo implements LoadTaboolaAccountInfo {
  private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
  private readonly decrypter: Decrypter

  constructor (decrypter: Decrypter, loadAccountByTokenRepository: LoadAccountByTokenRepository) {
    this.decrypter = decrypter
    this.loadAccountByTokenRepository = loadAccountByTokenRepository
  }

  async loadInfo(accessToken: string): Promise<TaboolaAccountInfoModel> {
    const account = await this.loadAccountByTokenRepository.loadByToken(accessToken)

    if (!account.taboola_info) return null

    const decryptedInfo = await this.decrypter.decrypt(account.taboola_info)
    return ({
      account_id: decryptedInfo.accoutId,
      client_id: decryptedInfo.clientId,
      client_secret: decryptedInfo.clientSecret,
      access_token: account.taboola_access_token
    })
  }
}

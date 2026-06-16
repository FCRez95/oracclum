import { AddTaboolaInfo } from "../../../domain/usecases/integrations/add-taboola-info";
import { Encrypter } from "../../protocols/criptography/encrypter";
import { AddTaboolaInfoRepository } from "../../protocols/db/account/add-taboola-info-repository";
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository";
import { LoadUsedTaboolaAccountByIdRepository } from "../../protocols/db/used-taboola-account/load-used-taboola-account-by-id-repository";
import { SaveUsedTaboolaAccountRepository } from "../../protocols/db/used-taboola-account/save-used-taboola-account-repository";
import { CreateTbToken } from "../../protocols/external-apis/create-taboola-token";
import { ProviderAccountInUseError } from "../../../presentation/errors";

export class DbAddTaboolaInfo implements AddTaboolaInfo {
  private readonly encrypter: Encrypter
  private readonly addTaboolaInfoRepository : AddTaboolaInfoRepository
  private readonly updateByIdRepository: UpdateByIdRepository
  private readonly loadUsedTaboolaAccountByIdRepository: LoadUsedTaboolaAccountByIdRepository
  private readonly saveUsedTaboolaAccountRepository: SaveUsedTaboolaAccountRepository
  private readonly createTbToken: CreateTbToken
  
  constructor (
    encrypter: Encrypter,
    addTaboolaInfoRepository : AddTaboolaInfoRepository,
    updateByIdRepository: UpdateByIdRepository,
    loadUsedTaboolaAccountByIdRepository: LoadUsedTaboolaAccountByIdRepository,
    saveUsedTaboolaAccountRepository: SaveUsedTaboolaAccountRepository,
    createTbToken: CreateTbToken
  ) {
    this.encrypter = encrypter
    this.addTaboolaInfoRepository = addTaboolaInfoRepository
    this.updateByIdRepository = updateByIdRepository
    this.loadUsedTaboolaAccountByIdRepository = loadUsedTaboolaAccountByIdRepository
    this.saveUsedTaboolaAccountRepository = saveUsedTaboolaAccountRepository
    this.createTbToken = createTbToken
  }
  
  async addInfo(id_user: number, accoutId: string, clientId: string, clientSecret: string): Promise<string> {
    const usedTaboolaAccount = await this.loadUsedTaboolaAccountByIdRepository.loadByTaboolaId(accoutId)
    if (usedTaboolaAccount && usedTaboolaAccount.id_user !== id_user) {
      await this.updateByIdRepository.updateById(id_user, 'allow_clicks', '0')
      throw new ProviderAccountInUseError()
    }

    const value = {
      accoutId: accoutId,
      clientId: clientId,
      clientSecret: clientSecret
    }
    const encryptedInfo = await this.encrypter.encrypt(value)

    const [, , tb_token] = await Promise.all([
      this.addTaboolaInfoRepository.addTaboolaInfo(id_user, encryptedInfo),
      usedTaboolaAccount ? Promise.resolve() : this.saveUsedTaboolaAccountRepository.save(id_user, accoutId),
      this.createTbToken.createAccessToken(id_user, value)
    ])
    return tb_token
  }
}

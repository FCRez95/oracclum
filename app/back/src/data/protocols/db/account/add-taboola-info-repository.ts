import { AddAccountModel } from '../../../../domain/usecases/account/add-account'
import { AccountModel } from '../../../../domain/models/account'

export interface AddTaboolaInfoRepository {
  addTaboolaInfo (id_user: number, encryptedInfo: string): Promise<void>
}

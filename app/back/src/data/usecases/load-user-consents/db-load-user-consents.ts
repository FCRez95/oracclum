import { UserConsentsModel } from '../../../domain/models/user-consents'
import { LoadUserConsents } from '../../../domain/usecases/user-consents/load-user-consents'
import { Decrypter } from '../../protocols/criptography/decrypter'
import { LoadUserConsentsRepository} from "../../protocols/db/user-consents/load-user-consents-repository"

export class DbLoadUserConsents implements LoadUserConsents {
  private readonly loadUserConsentsRepository: LoadUserConsentsRepository

  constructor (loadUserConsentsRepository: LoadUserConsentsRepository) {
    this.loadUserConsentsRepository = loadUserConsentsRepository
  }

  async load (idUser: number): Promise<UserConsentsModel> {

    const userConsents = await this.loadUserConsentsRepository.loadUserConsents(idUser)
    
    if (!userConsents) {
      return null
    }

    return userConsents
  }
}

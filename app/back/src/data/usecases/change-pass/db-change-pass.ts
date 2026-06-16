import { ChangePass } from '../../../domain/usecases/account/change-password'
import { ChangePassRepository } from '../../protocols/db/account/change-pass-repository'
import { Hasher } from '../authentication/db-authentication-protocols'

export class DbChangePass implements ChangePass {
  private readonly hasher: Hasher
  private readonly changePassRepository: ChangePassRepository

  constructor (hasher: Hasher, changePassRepository: ChangePassRepository) {
    this.hasher = hasher
    this.changePassRepository = changePassRepository
  }

  async change (id_user: number, password: string): Promise<void> {
    const hashed_pass = await this.hasher.hash(password)
    await this.changePassRepository.changePassword(id_user, hashed_pass)
  }
}

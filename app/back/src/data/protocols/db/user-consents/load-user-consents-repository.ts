import { UserConsentsModel } from '../../../../domain/models/user-consents'

export interface LoadUserConsentsRepository {
  loadUserConsents (idUser: number): Promise<UserConsentsModel | null>
}
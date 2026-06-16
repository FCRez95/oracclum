import { UserConsentsModel } from "../../models/user-consents";

export interface LoadUserConsents {
  load (idUser: number): Promise<UserConsentsModel | null>
}

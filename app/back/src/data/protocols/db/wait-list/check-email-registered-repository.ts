import { WaitListModel } from "../../../../domain/models/wait-list";

export interface CheckEmailRegisteredRepository {
  check(email: string): Promise<WaitListModel | null>
}
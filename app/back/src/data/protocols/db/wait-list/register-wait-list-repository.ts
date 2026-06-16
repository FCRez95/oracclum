import { WaitListModel } from "../../../../domain/models/wait-list";
import { AddWaitListModel } from "../../../../domain/usecases/wait-list/register-wait-list";

export interface AddWaitListRepository {
  add (client: AddWaitListModel): Promise<WaitListModel>
}
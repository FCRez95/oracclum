import { AddWaitListModel } from '../../../../domain/usecases/wait-list/register-wait-list'
import { WaitListModel } from '../../../../domain/models/wait-list'

export const mapCreatedClient = (addedClient: AddWaitListModel, addedCLientId: number): WaitListModel => {
  return Object.assign({}, addedClient, { id: addedCLientId })
}

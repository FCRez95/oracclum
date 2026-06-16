import { WaitListModel } from "../../../domain/models/wait-list";
import { AddWaitListModel, RegisterWaitList } from "../../../domain/usecases/wait-list/register-wait-list";
import { CheckEmailRegisteredRepository } from "../../protocols/db/wait-list/check-email-registered-repository";
import { AddWaitListRepository } from "../../protocols/db/wait-list/register-wait-list-repository";

export class DbRegisterWaitList implements RegisterWaitList {
  private readonly checkEmailRegistered: CheckEmailRegisteredRepository
  private readonly addWaitListRepository: AddWaitListRepository

  constructor (checkEmailRegistered: CheckEmailRegisteredRepository, addWaitListRepository: AddWaitListRepository) {
    this.checkEmailRegistered = checkEmailRegistered
    this.addWaitListRepository = addWaitListRepository
  }

  async register(client: AddWaitListModel): Promise<WaitListModel> {
    const clientFound = await this.checkEmailRegistered.check(client.email)
    if (clientFound) return null

    const newClient = await this.addWaitListRepository.add(client)
    return newClient
  }
}
import { Pool } from "mysql2";
import { CheckEmailRegisteredRepository } from "../../../../data/protocols/db/wait-list/check-email-registered-repository";
import { AddWaitListRepository } from "../../../../data/protocols/db/wait-list/register-wait-list-repository";
import { WaitListModel } from "../../../../domain/models/wait-list";
import { AddWaitListModel } from "../../../../domain/usecases/wait-list/register-wait-list";
import { getOne, insertOne } from "../mysql-helper";
import { mapCreatedClient } from "./wait-list-mysql-repository-helper";

export class WaitListMysqlRepository implements CheckEmailRegisteredRepository, AddWaitListRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async check(email: string): Promise<WaitListModel> {
    const result = await getOne(this.connectionPool, 'wait_list', 'email', email)
    return result[0]
  }
  
  async add(client: AddWaitListModel): Promise<WaitListModel> {
    const result = await insertOne(this.connectionPool, 'wait_list', client)
    return mapCreatedClient(client, result.insertId)
  }
}
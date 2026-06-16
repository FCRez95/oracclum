import { WaitListModel } from "../../models/wait-list"

export interface AddWaitListModel {
  name: string
  email: string
  cel: string
  prom_code?: string
}

export interface RegisterWaitList {
  register (client: AddWaitListModel): Promise<WaitListModel | null>
}
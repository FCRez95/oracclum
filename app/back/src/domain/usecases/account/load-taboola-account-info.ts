import { TaboolaAccountInfoModel } from "../../models/taboola-account-info";

export interface LoadTaboolaAccountInfo {
  loadInfo(accessToken: string) : Promise<TaboolaAccountInfoModel | null>
}
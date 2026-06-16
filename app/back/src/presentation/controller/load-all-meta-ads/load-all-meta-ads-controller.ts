import { LoadAllMetaAds } from "../../../domain/usecases/meta-ads/load-all-meta-ads";
import { ok, serverError, badRequest, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadAllMetaAdsController implements Controller {
  private readonly loadAllMetaAds: LoadAllMetaAds

  constructor (loadAllMetaAds: LoadAllMetaAds) {
    this.loadAllMetaAds = loadAllMetaAds
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let allAds

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        allAds = await this.loadAllMetaAds.loadAllByDateRange(idUser, id_campaign, { startDate: start, endDate: end })
      } else {
        const parsedDays = parseInt(days, 10)
        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        allAds = await this.loadAllMetaAds.loadAll(idUser, id_campaign, parsedDays)
      }

      if (!allAds) return unauthorized()

      return ok(allAds)
    }
    catch (error) {
      return serverError(error)
    }
  }
}

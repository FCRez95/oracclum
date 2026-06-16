import { LoadAllMetaAdSets } from "../../../domain/usecases/meta-ad-sets/load-all-ad-sets-summary";
import { ok, serverError, badRequest, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadAllMetaAdsetsController implements Controller {
  private readonly loadAllMetaAdSets: LoadAllMetaAdSets

  constructor (loadAllAdsSummary: LoadAllMetaAdSets) {
    this.loadAllMetaAdSets = loadAllAdsSummary
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let allAdSets

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        allAdSets = await this.loadAllMetaAdSets.loadAllByDateRange(idUser, id_campaign, { startDate: start, endDate: end })
      } else {
        const parsedDays = parseInt(days, 10)
        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        allAdSets = await this.loadAllMetaAdSets.loadAll(idUser, id_campaign, parsedDays)
      }

      if (!allAdSets) return unauthorized()

      return ok(allAdSets)
    }
    catch (error) {
      return serverError(error)
    }
  }
}

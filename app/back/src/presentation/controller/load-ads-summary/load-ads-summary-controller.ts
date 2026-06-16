import { LoadAllAdsSummary } from "../../../domain/usecases/ads/load-all-ads-summary";
import { ok, serverError, taboolaTimeOut, taboolaTooMany, unauthorized, badRequest } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadAdsSummaryController implements Controller {
  private readonly loadAllAdsSummary: LoadAllAdsSummary;

  constructor(loadAllAdsSummary: LoadAllAdsSummary) {
    this.loadAllAdsSummary = loadAllAdsSummary;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let allAdsSummary

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        allAdsSummary = await this.loadAllAdsSummary.loadAllByDateRange(idUser, id_campaign, { startDate: start, endDate: end })
      } else {
        const parsedDays = parseInt(days, 10)
        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        allAdsSummary = await this.loadAllAdsSummary.loadAll(idUser, id_campaign, parsedDays)
      }

      if (!allAdsSummary) return unauthorized()

      return ok(allAdsSummary)

    } catch (error) {
      if (error.message === 'Taboola too many requests') {
        return taboolaTooMany(error)
      }
      if (error.message === 'Taboola timeout') {
        return taboolaTimeOut(error)
      }
      return serverError(error)
    }
  }
}

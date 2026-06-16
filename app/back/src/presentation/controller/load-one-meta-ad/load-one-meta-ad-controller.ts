import { LoadOneMetaAd } from "../../../domain/usecases/meta-ads/load-one-meta-ad";
import { ok, serverError, badRequest, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadOneMetaAdController implements Controller {
  private readonly loadOneMetaAd: LoadOneMetaAd

  constructor (loadOneMetaAd: LoadOneMetaAd) {
    this.loadOneMetaAd = loadOneMetaAd
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, id_ad_meta, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let adSummary

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        adSummary = await this.loadOneMetaAd.loadOneByDateRange(idUser, id_campaign, id_ad_meta, {
          startDate: start,
          endDate: end
        })
      } else {
        const parsedDays = parseInt(days, 10)
        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        adSummary = await this.loadOneMetaAd.loadOne(idUser, id_campaign, id_ad_meta, parsedDays)
      }

      if (!adSummary) return unauthorized()

      return ok(adSummary)
    } catch (error) {
      return serverError(error)
    }
  }
}

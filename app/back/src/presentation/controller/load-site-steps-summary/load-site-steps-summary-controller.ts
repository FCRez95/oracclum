import { badRequest, ok, serverError, taboolaTimeOut, taboolaTooMany, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";
import { LoadSiteStepsSummary } from "../../../domain/usecases/campaign/load-site-steps-summary";

export class LoadSiteStepsSummaryController implements Controller {
  private readonly loadSiteStepsSummary: LoadSiteStepsSummary
  constructor(loadSiteStepsSummary: LoadSiteStepsSummary) {
    this.loadSiteStepsSummary = loadSiteStepsSummary
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, id_site, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let stepsData

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        stepsData = await this.loadSiteStepsSummary.loadByDateRange(idUser, id_campaign, id_site, { startDate: start, endDate: end })
      } else {
        const parsedDays = parseInt(days, 10)

        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        stepsData = await this.loadSiteStepsSummary.load(idUser, id_campaign, id_site, parsedDays);
      }

      if (!stepsData) return unauthorized();
 
      return ok(stepsData);

    } catch (error) {
      if (error.message === "Taboola too many requests") {
        return taboolaTooMany(error);
      }
      if (error.message === "Taboola timeout") {
        return taboolaTimeOut(error);
      }
      return serverError(error);
    }
  }
}

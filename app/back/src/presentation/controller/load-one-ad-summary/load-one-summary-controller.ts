import { LoadAllAdsSummary } from "../../../domain/usecases/ads/load-all-ads-summary";
import { LoadOneAdSummary } from "../../../domain/usecases/ads/load-one-add-summary";
import { ok, serverError, taboolaTimeOut, taboolaTooMany, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadOneAdSummaryController implements Controller {
  private readonly loadOneAdSummary: LoadOneAdSummary

  constructor (loadAllAdsSummary: LoadOneAdSummary) {
    this.loadOneAdSummary = loadAllAdsSummary
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, id_ads_taboola, days } = httpRequest.params;
      const { idUser } = httpRequest.body;

      let adSummary;

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|');

        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
        if (!isValidDate(start) || !isValidDate(end)) {
          return {
            statusCode: 400,
            body: new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD')
          };
        }

        adSummary = await this.loadOneAdSummary.loadOneByDateRange(idUser, id_campaign, id_ads_taboola, {
          startDate: start,
          endDate: end
        });
      } else {
        const parsedDays = parseInt(days, 10);

        if (isNaN(parsedDays)) {
          return {
            statusCode: 400,
            body: new Error('Invalid days parameter. Expected number or date range.')
          };
        }

        adSummary = await this.loadOneAdSummary.loadOne(idUser, id_campaign, id_ads_taboola, parsedDays);
      }

      if (!adSummary) return unauthorized();

      return ok(adSummary);
    } catch (error) {
      if (error.message === 'Taboola too many requests') {
        return taboolaTooMany(error);
      }
      if (error.message === 'Taboola timeout') {
        return taboolaTimeOut(error);
      }
      return serverError(error);
    }
  }
}

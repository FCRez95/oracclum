import { CampaignSiteSummaryModel } from "../../../domain/models/campaign-site-summary";
import { LoadCampaignSitesSummary } from "../../../domain/usecases/campaign/load-campaign-sites-summary";
import { badRequest, ok, serverError, taboolaTimeOut, taboolaTooMany, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadCampaignSitesSummaryController implements Controller {
  private readonly loadAdSitesSummary: LoadCampaignSitesSummary

  constructor(loadAdSitesSummary: LoadCampaignSitesSummary) {
    this.loadAdSitesSummary = loadAdSitesSummary
  }
  
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body
      const { id_campaign, days } = httpRequest.params

      let adSitesSummary: CampaignSiteSummaryModel[];
  
      if (typeof days === "string" && days.includes("|")) {
        const [start, end] = days.split("|");

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(
            new Error("Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD")
          );
        }
        adSitesSummary = await this.loadAdSitesSummary.loadAllSitesByDateRange(
          idUser,
          id_campaign,
          { startDate: start, endDate: end }
        );
      } else {
        const parsedDays = parseInt(days, 10);

        if (isNaN(parsedDays)) {
          return badRequest(
            new Error("Invalid days parameter. Expected number or date range.")
          );
        }

        adSitesSummary = await this.loadAdSitesSummary.loadAllSites(
          idUser,
          id_campaign,
          parsedDays
        );
      }
      
      if (!adSitesSummary) return unauthorized()
      return ok(adSitesSummary)
    } catch(error) {
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

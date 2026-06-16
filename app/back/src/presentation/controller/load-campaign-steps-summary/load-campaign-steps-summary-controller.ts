import { LoadCampaignByTime } from "../../../domain/usecases/campaign/load-campaign-by-time";
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from "../../helpers/http-helper";
import {
  Controller,
  HttpRequest,
  HttpResponse,
  Validation,
} from "../../protocols";

export class LoadCampaignSummaryController implements Controller {
  private readonly loadCampaignByTime: LoadCampaignByTime;

  constructor(loadFunnelsByTime: LoadCampaignByTime) {
    this.loadCampaignByTime = loadFunnelsByTime;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, days } = httpRequest.params;
      const { idUser } = httpRequest.body;

      let campaign;

      if (typeof days === "string" && days.includes("|")) {
        const [start, end] = days.split("|");

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(
            new Error("Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD")
          );
        }

        campaign = await this.loadCampaignByTime.loadByDateRange(
          id_campaign,
          idUser,
          { startDate: start, endDate: end }
        );
      } else {
        const parsedDays = parseInt(days, 10);

        if (isNaN(parsedDays)) {
          return badRequest(
            new Error("Invalid days parameter. Expected number or date range.")
          );
        }

        campaign = await this.loadCampaignByTime.load(
          id_campaign,
          idUser,
          parsedDays
        );
      }

      if (!campaign) {
        return unauthorized();
      }

      return ok(campaign);
    } catch (error) {
      return serverError(error);
    }
  }
}

import {
  badRequest,
  noContent,
  ok,
  serverError,
  taboolaTimeOut,
  taboolaTooMany,
} from "../../helpers/http-helper";
import {
  Controller,
  HttpRequest,
  HttpResponse,
  LoadUserCampaigns,
} from "./load-user-campaigns-controller-protocols";

export class LoadUserCampaignsController implements Controller {
  private readonly loadUserCampaigns: LoadUserCampaigns;

  constructor(loadUserCampaigns: LoadUserCampaigns) {
    this.loadUserCampaigns = loadUserCampaigns;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body;
      const { days } = httpRequest.params;

      let campaigns;

      if (typeof days === "string" && days.includes("|")) {
        const [start, end] = days.split("|");

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(
            new Error("Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD")
          );
        }

        campaigns = await this.loadUserCampaigns.loadByDateRange(idUser, {
          startDate: start,
          endDate: end,
        });
      } else {
        const parsedDays = parseInt(days, 10);

        if (isNaN(parsedDays)) {
          return badRequest(
            new Error("Invalid days parameter. Expected number or date range.")
          );
        }

        campaigns = await this.loadUserCampaigns.load(idUser, parsedDays);
      }

      if (!campaigns) {
        return noContent();
      }

      return ok(campaigns);
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

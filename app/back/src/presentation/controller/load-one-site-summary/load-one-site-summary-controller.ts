import { OptimizationData } from "../../../domain/models/optimization-data";
import { LoadOneSiteSummary } from "../../../domain/usecases/campaign/load-one-site-summary";
import {
  badRequest,
  ok,
  serverError,
  taboolaTimeOut,
  taboolaTooMany,
  unauthorized,
} from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadOneSiteSummaryController implements Controller {
  private readonly loadOneSiteSummary: LoadOneSiteSummary;

  constructor(loadOneSiteSummary: LoadOneSiteSummary) {
    this.loadOneSiteSummary = loadOneSiteSummary;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, id_site, days } = httpRequest.params;
      const { idUser } = httpRequest.body;

      let siteSummary: OptimizationData | null;

      if (typeof days === "string" && days.includes("|")) {
        const [start, end] = days.split("|");

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(
            new Error("Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD")
          );
        }
        siteSummary = await this.loadOneSiteSummary.loadOneByDateRange(
          idUser,
          id_campaign,
          id_site,
          { startDate: start, endDate: end }
        );
      } else {
        const parsedDays = parseInt(days, 10);

        if (isNaN(parsedDays)) {
          return badRequest(
            new Error("Invalid days parameter. Expected number or date range.")
          );
        }

        siteSummary = await this.loadOneSiteSummary.loadOne(
          idUser,
          id_campaign,
          id_site,
          parsedDays
        );
      }

      if (!siteSummary) return unauthorized();
      return ok(siteSummary);
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

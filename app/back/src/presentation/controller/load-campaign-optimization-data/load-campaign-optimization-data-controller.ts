import { badRequest, ok, serverError, taboolaTimeOut, taboolaTooMany, unauthorized } from '../../helpers/http-helper'
import { Controller, GetCampaignOptimizationData, HttpRequest, HttpResponse } from './load-campaign-optimization-data-controller-protocols'

export class LoadCampaignOptimizationDataController implements Controller {
  private readonly getCampaignOptimizationData: GetCampaignOptimizationData

  constructor (getCampaignOptimizationData: GetCampaignOptimizationData) {
    this.getCampaignOptimizationData = getCampaignOptimizationData
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign, days } = httpRequest.params
      const { idUser } = httpRequest.body

      let campaign

      if (typeof days === 'string' && days.includes('|')) {
        const [start, end] = days.split('|')

        // validacao
        const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)

        if (!isValidDate(start) || !isValidDate(end)) {
          return badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD'))
        }

        campaign = await this.getCampaignOptimizationData.getByDateRange(idUser, id_campaign, { startDate: start, endDate: end })
      } else {
        const parsedDays = parseInt(days, 10)

        if (isNaN(parsedDays)) {
          return badRequest(new Error('Invalid days parameter. Expected number or date range.'))
        }

        campaign = await this.getCampaignOptimizationData.get(idUser, id_campaign, parsedDays)
      }

      if (!campaign) {
        return unauthorized()
      }

      return ok(campaign)

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

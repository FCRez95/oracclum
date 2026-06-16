import { Router } from 'express'
import { makeAddCampaignController } from '../factories/controllers/add-campaign/add-campaign-controller-factory'
import { adptRoute } from '../adapters/express-route-adapter'
import { Pool } from 'mysql2'
import { adptMiddleware } from '../adapters/express-middleware-adapter'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory'
import { makeLoadCampaignOptimizationDataController } from '../factories/controllers/load-campaign-optimization-data/load-campaign-optimization-data-controller-factory'
import { makeLoadUserCampaignsController } from '../factories/controllers/load-user-campaigns/load-user-campaigns-controller-factory'
import { makeLoadCampaignSitesSummaryController } from '../factories/controllers/load-campaign-sites-summary/load-campaign-sites-summary-controller'
import { makeLoadOneSiteSummaryController } from '../factories/controllers/load-one-site-summary/load-one-site-summary-controller'
import { makeDeleteCampaignController } from '../factories/controllers/delete-campaign/delete-campaign-controller-factory'
import { makeLoadCampaignStepsByTimeController } from '../factories/controllers/load-campaign-steps-by-time/load-campaign-steps-by-time-controller-factory'
import { makeUserConsentsMiddleware } from '../factories/middlewares/user-consents-middleware-factory'
import { makeLoadSiteStepsSummaryController } from '../factories/controllers/load-site-steps-summary/load-site-steps-summary-controller'
import { makeEditCampaignController } from '../factories/controllers/edit-campaign/edit-campaign-controller-factory'
import { makeEditCampaignLinkController } from '../factories/controllers/edit-campaign/edit-campaign-link-controller-factory'
import { makeLoadClickByIdController } from '../factories/controllers/load-click-by-id/load-click-by-id-controller-factory'
import { makeLoadMetaClickByIdController } from '../factories/controllers/load-meta-click-by-id/load-meta-click-by-id-controller-factory'
import { makeLoadIntegrationStatusController } from '../factories/controllers/load-integration-status/load-integration-status-controller-factory'
import { makeSavePixelInfoController } from '../factories/controllers/save-pixel-info/save-pixel-info-controller-factory'
import { makeUpdateIntegrationStatusController } from '../factories/controllers/update-integration-status/update-integration-status-controller-factory'
import { backendDemoResponse } from '../../demo/demo-route'
import { backendDemoData } from '../../demo/demo-data'

export default (router: Router, pool: Pool) => {
  const auth = adptMiddleware(makeAuthMiddleware(pool))
  const userConsentsAuth = adptMiddleware(makeUserConsentsMiddleware(pool))

  //Endpoints for all campaigns
  router.post('/add-campaign', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.createdCampaign(req.body)), adptRoute(makeAddCampaignController(pool)))
  router.get('/load-user-campaigns', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.campaigns()), adptRoute(makeLoadUserCampaignsController(pool)))
  router.post('/edit-campaign', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo campaign updated.')), adptRoute(makeEditCampaignController(pool)))
  router.post('/edit-campaign-link', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo campaign link updated.')), adptRoute(makeEditCampaignLinkController(pool)))
  router.post('/save-pixel-info', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo pixel info saved.')), adptRoute(makeSavePixelInfoController(pool)))
  router.post('/update-integration-status', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo integration status updated.')), adptRoute(makeUpdateIntegrationStatusController(pool)))

  router.get('/load-user-campaigns/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.campaigns()), adptRoute(makeLoadUserCampaignsController(pool)))

  //Endpoints for campaign data
  router.get('/click/:id_click', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.click(String(req.params.id_click), req.query.id_campaign as string)), adptRoute(makeLoadClickByIdController(pool)))
  router.get('/click-meta/:id_click', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.metaClick(String(req.params.id_click))), adptRoute(makeLoadMetaClickByIdController(pool)))
  router.get('/load-campaign-optimization-data/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.campaignOptimization(String(req.params.id_campaign))), adptRoute(makeLoadCampaignOptimizationDataController(pool)))
  router.get('/load-campaign-steps-by-time/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.campaignSteps(String(req.params.id_campaign))), adptRoute(makeLoadCampaignStepsByTimeController(pool)))
  router.get('/load-campaign-sites-summary/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.sites()), adptRoute(makeLoadCampaignSitesSummaryController(pool)))
  router.get('/load-integration-status/:id_campaign', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.integrationStatus()), adptRoute(makeLoadIntegrationStatusController(pool)))
  router.get('/load-one-site-summary/:id_campaign/:id_site/:days', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.siteSummary(String(req.params.id_site))), adptRoute(makeLoadOneSiteSummaryController(pool)))
  router.get('/load-site-steps-by-time/:id_campaign/:id_site/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.siteSteps()), adptRoute(makeLoadSiteStepsSummaryController(pool)))
  router.post('/delete-campaign', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo campaign deleted.')), adptRoute(makeDeleteCampaignController(pool)))
}

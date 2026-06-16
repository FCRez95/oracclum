import { Router } from 'express'
import { adptRoute } from '../adapters/express-route-adapter'
import { Pool } from 'mysql2'
import { adptMiddleware } from '../adapters/express-middleware-adapter'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory'
import { makeLoadAdsSummaryController } from '../factories/controllers/load-all-ads-summary/load-all-ads-summary-controller'
import { makeLoadOneAdSummaryController } from '../factories/controllers/load-one-ad-summary/load-one-ad-summary-controller'
import { makeLoadAllMetaAdsetsController } from '../factories/controllers/load-all-meta-adsets/load-all-meta-adsets-controller'
import { makeLoadAllMetaAdsController } from '../factories/controllers/load-all-meta-ads/load-all-meta-ads-controller'
import { makeLoadOneMetaAdController } from '../factories/controllers/load-one-meta-ad/load-one-meta-ad-controller'
import { makeUserConsentsMiddleware } from '../factories/middlewares/user-consents-middleware-factory'
import { backendDemoResponse } from '../../demo/demo-route'
import { backendDemoData } from '../../demo/demo-data'

export default (router: Router, pool: Pool) => {
  const auth = adptMiddleware(makeAuthMiddleware(pool))
  const userConsentsAuth = adptMiddleware(makeUserConsentsMiddleware(pool))

  // Taboola routes
  router.get('/load-ads-summary/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ads()), adptRoute(makeLoadAdsSummaryController(pool)))
  router.get('/load-ad-summary/:id_campaign/:id_ads_taboola/:days', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.adSummary(String(req.params.id_ads_taboola))), adptRoute(makeLoadOneAdSummaryController(pool)))

  // Meta Ads routes
  router.get('/load-all-meta-adsets/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.metaAdsets()), adptRoute(makeLoadAllMetaAdsetsController(pool)))
  router.get('/load-all-meta-ads/:id_campaign/:days', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.metaAds()), adptRoute(makeLoadAllMetaAdsController(pool)))
  router.get('/load-one-meta-ad/:id_campaign/:id_ad_meta/:days', auth, userConsentsAuth, backendDemoResponse(req => backendDemoData.metaAdSummary(String(req.params.id_ad_meta))), adptRoute(makeLoadOneMetaAdController(pool)))
}

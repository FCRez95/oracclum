import { Router } from 'express'
import { adptRoute } from '../adapters/express-route-adapter'
import { Pool } from 'mysql2'
import { adptMiddleware } from '../adapters/express-middleware-adapter'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory'
import { makeUserConsentsMiddleware } from '../factories/middlewares/user-consents-middleware-factory'
import { makeAcceptTermsController } from '../factories/controllers/accept-terms/accept-terms-controller-factory'
import { makeLoadUserConsentsController } from '../factories/controllers/load-user-consents/load-user-consents-controller-factory'

export default (router: Router, pool: Pool) => {
  const auth = adptMiddleware(makeAuthMiddleware(pool))
  const userConsentsAuth = adptMiddleware(makeUserConsentsMiddleware(pool))
  router.post('/accept-terms', auth, adptRoute(makeAcceptTermsController(pool)))
  router.get('/load-user-consents', auth, userConsentsAuth, adptRoute(makeLoadUserConsentsController(pool)))
}

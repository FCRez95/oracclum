import { Router } from 'express'
import { makeSignUpController } from '../factories/controllers/signup/signup-controller-factory'
import { makeLoginController } from '../factories/controllers/login/login-controller-factory'
import { makeLoadUserDataController } from '../factories/controllers/load-user-data/load-user-controller-factory'
import { adptRoute } from '../adapters/express-route-adapter'
import { Pool } from 'mysql2'
import { adptMiddleware } from '../adapters/express-middleware-adapter'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory'
import { makeLogoutController } from '../factories/controllers/logout/logout-controller-factory'
import { makeChangePassController } from '../factories/controllers/change-pass/change-pass-controller-factory'
import { makeAddTaboolaInfoController } from '../factories/controllers/add-taboola-info-controller/add-taboola-info-controller-factory'
import { makeAddMetaInfoController } from '../factories/controllers/add-meta-info-controller/add-meta-info-controller-factory'
import { makeLoadTaboolaAccountInfoController } from '../factories/controllers/load-taboola-account-info/load-taboola-account-info-controller-factory'
import { makeLoadAllUsersController } from '../factories/controllers/load-all-accounts/load-all-accounts-controller-factory'
import { makeUserConsentsMiddleware } from '../factories/middlewares/user-consents-middleware-factory'
import { makeLoadEnrichedUserDataController } from '../factories/controllers/load-enriched-user-data/load-enriched-user-data-controller-factory'
import { makeDisconnectMetaController } from '../factories/controllers/disconnect-meta-controller/disconnect-meta-controller-factory'
import { makeLoadMetaInfoController } from '../factories/controllers/load-meta-info-controller/load-meta-info-controller-factory'
import { makeDeleteAccountController } from '../factories/controllers/delete-account/delete-account-controller-factory'
import { makeDeactivateAccountController } from '../factories/controllers/deactivate-account/deactivate-account-controller-factory'
import { makeActivateAccountController } from '../factories/controllers/activate-account/activate-account-controller-factory'
import { makeClearAccountDataController } from '../factories/controllers/clear-account-data/clear-account-data-controller-factory'
import { backendDemoByToken, backendDemoLogin, backendDemoResponse } from '../../demo/demo-route'
import { backendDemoData } from '../../demo/demo-data'

export default (router: Router, pool: Pool) => {
  const auth = adptMiddleware(makeAuthMiddleware(pool))
  const adminAuth = adptMiddleware(makeAuthMiddleware(pool, 'admin'))
  const userConsentsAuth = adptMiddleware(makeUserConsentsMiddleware(pool))
  
  router.post('/signup', adptRoute(makeSignUpController(pool)))
  router.post('/login', backendDemoLogin, adptRoute(makeLoginController(pool)))
  router.get('/loadUserData', backendDemoByToken(() => backendDemoData.user()), adptRoute(makeLoadUserDataController(pool)))
  router.post('/logout', auth, backendDemoResponse(() => backendDemoData.ok('Demo logout completed.')), adptRoute(makeLogoutController(pool)))
  router.post('/change-pass', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo password changed.')), adptRoute(makeChangePassController(pool)))
  router.post('/add-taboola-info', auth, userConsentsAuth, backendDemoResponse(() => ({ tb_access_token: 'demo-taboola-token' })), adptRoute(makeAddTaboolaInfoController(pool)))
  router.post('/add-meta-info', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.ok('Demo Meta integration saved.')), adptRoute(makeAddMetaInfoController(pool)))
  router.get('/load-taboola-info', auth, userConsentsAuth, backendDemoResponse(() => backendDemoData.taboolaInfo()), adptRoute(makeLoadTaboolaAccountInfoController(pool)))
  router.get('/load-all-users', adminAuth, adptRoute(makeLoadAllUsersController(pool)))
  router.get('/load-enriched-user-data', auth, backendDemoResponse(() => backendDemoData.enrichedUser()), adptRoute(makeLoadEnrichedUserDataController(pool)))
  router.post('/delete-meta-info', auth, backendDemoResponse(() => backendDemoData.ok('Demo Meta integration removed.')), adptRoute(makeDisconnectMetaController(pool)))
  router.post('/delete-my-data', auth, backendDemoResponse(() => backendDemoData.ok('Demo user data deletion completed.')), adptRoute(makeClearAccountDataController(pool)))
  router.get('/load-meta-info', auth, backendDemoResponse(() => backendDemoData.metaInfo()), adptRoute(makeLoadMetaInfoController(pool)))
  router.post('/delete-user', adminAuth, adptRoute(makeDeleteAccountController(pool)))
  router.post('/deactivate-user', adminAuth, adptRoute(makeDeactivateAccountController(pool)))
  router.post('/activate-user', adminAuth, adptRoute(makeActivateAccountController(pool)))
}

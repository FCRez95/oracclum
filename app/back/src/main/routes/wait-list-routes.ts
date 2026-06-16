import { Router } from 'express'
import { adptRoute } from '../adapters/express-route-adapter'
import { Pool } from 'mysql2'
import { makeRegisterWaitListController } from '../factories/controllers/register-wait-list-controller/register-waitlist-controller-factory'

export default (router: Router, pool: Pool) => {

  router.post('/add-wait-list', adptRoute(makeRegisterWaitListController(pool)))
}

/* eslint-disable node/no-path-concat */
/* eslint-disable no-unused-expressions */
import { Express, Router } from 'express'
import { Pool } from 'mysql2'
import { readdirSync } from 'fs'

export default (app: Express, pool: Pool): void => {
  const router = Router()
  app.use('/api', router)
  readdirSync(`${__dirname}/../routes`).map(async file => {
    if (!file.includes('.test.')) {
      (await import(`../routes/${file}`)).default(router, pool)
    }
  })
}

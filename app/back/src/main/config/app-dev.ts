import express from 'express'
import setUpMiddlewares from './middlewares'
import setUpRoutes from './routes'
import env from './env'
import mysql from 'mysql2'

const app = express()
const connection = mysql.createPool(env.dbDev)
setUpMiddlewares(app)
setUpRoutes(app, connection)
export { app, connection }

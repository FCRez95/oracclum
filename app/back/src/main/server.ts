import { app } from './config/app-dev'
import env from './config/env'
import { validateEnv } from './config/validate-env'

validateEnv()
app.listen(env.port, () => console.log(`Server running at http://localhost:${env.port}`))

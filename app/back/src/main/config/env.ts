import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const loadEnvFile = (): void => {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return

  const envFile = readFileSync(envPath, 'utf8')
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) return

    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex === -1) return

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')

    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

loadEnvFile()

const numberFromEnv = (key: string, fallback: number): number => {
  const value = Number(process.env[key])
  return Number.isFinite(value) ? value : fallback
}

const databaseConfig = (prefix: string, fallbackDatabase: string) => ({
  host: process.env[`${prefix}_HOST`] || '127.0.0.1',
  user: process.env[`${prefix}_USER`] || 'oracclum',
  password: process.env[`${prefix}_PASSWORD`] || '',
  database: process.env[`${prefix}_NAME`] || fallbackDatabase,
  port: numberFromEnv(`${prefix}_PORT`, 3306)
})

export default {
  db: databaseConfig('DB', 'oracclum'),
  dbDev: databaseConfig('DB_DEV', 'oracclum_dev'),
  dbTest: databaseConfig('DB_TEST', 'oracclum_test'),
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || ''
}

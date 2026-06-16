const config = require('./jest.config')

config.testMatch = [
  '**/infra/db/mysql/**/*.spec.ts',
  '**/main/routes/**/*.test.ts'
]

module.exports = config

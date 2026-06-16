export class ProviderAccountInUseError extends Error {
  constructor () {
    super('Provider account already used by another user')
    this.name = 'ProviderAccountInUseError'
  }
}

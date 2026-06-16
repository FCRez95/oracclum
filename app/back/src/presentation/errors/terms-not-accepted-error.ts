export class TermsNotAcceptedError extends Error {
  constructor () {
    super('Terms of use not accepted')
    this.name = 'TermsNotAcceptedError'
  }
}

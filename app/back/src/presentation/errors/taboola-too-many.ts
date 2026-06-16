export class TaboolaTooMany extends Error {
  constructor (stack: string) {
    super('Taboola too many requests')
    this.name = 'TaboolaTooMany'
    this.stack = stack
  }
}

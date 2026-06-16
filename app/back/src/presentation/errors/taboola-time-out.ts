export class TaboolaTimeOut extends Error {
    constructor () {
      super('Taboola request timed out')
      this.name = 'TaboolaTimeOut'
    }
  }
  
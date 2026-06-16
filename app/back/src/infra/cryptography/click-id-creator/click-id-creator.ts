import bcrypt from 'bcrypt'
import { HashComparer } from '../../../data/protocols/criptography/hash-comparer'
import { Hasher } from '../../../data/protocols/criptography/hasher'

export class ClickIdCreator implements Hasher {
  private readonly letters: string
  private readonly numbers: string

  constructor () {
    this.letters = 'abcdefghijklmABCDEFGHIJKLM'
    this.numbers = '1234567890'
  }

  makeRandomStirng(length: number, pool: string): string {
    let result = '';
    const charactersLength = pool.length;
    let counter = 0;
    while (counter < length) {
      result += pool.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  makeClickAuth(): string {
    const time = new Date().getTime()
    
    return this.makeRandomStirng(10, this.letters) + '-' + this.makeRandomStirng(8, this.numbers) + time
  }

  async hash (value: any): Promise<string> {
    const hash = this.makeClickAuth()
    return hash
  }
}

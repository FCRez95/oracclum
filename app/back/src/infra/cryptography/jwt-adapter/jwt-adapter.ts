import { Encrypter } from '../../../data/protocols/criptography/encrypter'
import jwt from 'jsonwebtoken'
import { Decrypter } from '../../../data/protocols/criptography/decrypter'
import { ClickDecrypter, DecryptedClick } from '../../../data/protocols/criptography/click-decrypter'

export class JwtAdapter implements Encrypter, Decrypter, ClickDecrypter {
  private readonly secret: string

  constructor (secret: string) {
    this.secret = secret
  }

  async encrypt (value: any): Promise<string> {
    const createdAt = new Date().getTime()
    value = {
      ...value,
      createdAt
    }
    const accessToken = await jwt.sign(value, this.secret)
    return accessToken
  }

  async decrypt (value: string): Promise<any> {
    const payload: any = await jwt.verify(value, this.secret)
    return payload
  }

  async decryptClick (value: string): Promise<DecryptedClick> {
    const payload: any = await jwt.verify(value, this.secret)
    return payload
  }
}

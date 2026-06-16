/* eslint-disable no-undef */
import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

jest.mock('jsonwebtoken', () => ({
  async sign (): Promise<string> {
    return new Promise(resolve => resolve('generated_token'))
  },

  async verify (): Promise<string> {
    return new Promise(resolve => resolve('any_payload'))
  }
}))

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('JwtAdapter', () => {
  describe('encrypt()', () => {
    test('Should call jwt method sign with correct values', async () => {
      const sut = makeSut()
      const signSpy = jest.spyOn(jwt, 'sign')
      jest.spyOn(sut, 'encrypt').mockImplementationOnce((value) => {
        const createdAt = 'valid_date'
        value = {
          ...value,
          createdAt
        }
        const accessToken = jwt.sign(value, 'secret')
        return new Promise(resolve => resolve(accessToken))
      })
      await sut.encrypt({ id: 0 })
      expect(signSpy).toHaveBeenCalledWith({ 
        id: 0,
        createdAt: 'valid_date'
       }, 'secret')
    })

    test('Should throw if sign method throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.encrypt(0)
      await expect(promise).rejects.toThrow()
    })

    test('Should return a token if method sign succeeds', async () => {
      const sut = makeSut()
      const accessToken = await sut.encrypt(0)
      expect(accessToken).toBe('generated_token')
    })
  })

  describe('decrypt()', () => {
    test('Should call jwt method verify with correct values', async () => {
      const sut = makeSut()
      const verifySpy = jest.spyOn(jwt, 'verify')
      await sut.decrypt('any_token')
      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('Should return a value if method verify succeeds', async () => {
      const sut = makeSut()
      const decryptedValue = await sut.decrypt('any_token')
      expect(decryptedValue).toBe('any_payload')
    })

    test('Should throw if verify method throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.decrypt('any_token')
      await expect(promise).rejects.toThrow()
    })
  })

  describe('decrypt()', () => {
    test('Should call jwt method verify with correct values', async () => {
      const sut = makeSut()
      const verifySpy = jest.spyOn(jwt, 'verify')
      await sut.decryptClick('any_token')
      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('Should return a value if method verify succeeds', async () => {
      const sut = makeSut()
      const decryptedValue = await sut.decryptClick('any_token')
      expect(decryptedValue).toBe('any_payload')
    })

    test('Should throw if verify method throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.decryptClick('any_token')
      await expect(promise).rejects.toThrow()
    })
  })
})

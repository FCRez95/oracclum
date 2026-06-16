/* eslint-disable no-undef */
import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LogoutController } from './logout-controller'
import { HttpRequest, Authentication, Logout } from './logout-controller-protocols'

const makeLogout = (): Logout => {
  class LogoutStub implements Logout {
    async logout (id_user: number): Promise<null> {
      return new Promise(resolve => resolve(null))
    }
  }
  return new LogoutStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1,
    accessToken: 'any_token'
  }
})

interface SutTypes {
  sut: LogoutController,
  logoutStub: Logout
}

const makeSut = (): SutTypes => {
  const logoutStub = makeLogout()
  const sut = new LogoutController(logoutStub)
  return {
    sut,
    logoutStub
  }
}

describe('Logout Controller', () => {
  test('Should call Logout with correct values', async () => {
    const { sut, logoutStub } = makeSut()
    const authSpy = jest.spyOn(logoutStub, 'logout')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 'any_token')
  })

  test('Should return 500 if Logout throws', async () => {
    const { sut, logoutStub } = makeSut()
    jest.spyOn(logoutStub, 'logout').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok('Logout complete!'))
  })
})

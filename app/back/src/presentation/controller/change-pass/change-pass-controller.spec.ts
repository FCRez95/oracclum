/* eslint-disable no-undef */
import { ChangePassController } from './change-pass-controller'
import { ServerError } from '../../errors'
import { ChangePass } from "../../../domain/usecases/account/change-password";
import { ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";
import { AccountModel } from '../signup/signup-controller-protocols';

const makeChangePass = (): ChangePass => {
  class ChangePassStub implements ChangePass {
    async change (id_user: number, new_pass : string): Promise<void> {
    }
  }
  return new ChangePassStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    newPass: 'any_pass',
    idUser: 1,
  }
})

interface SutTypes {
  sut: ChangePassController
  changePassStub: ChangePass
}

const makeSut = (): SutTypes => {
  const changePassStub = makeChangePass()
  const sut = new ChangePassController(changePassStub)
  return {
    sut,
    changePassStub
  }
}

describe('ChangePassword Controller', () => {
  test('Should call ChangePass with correct values', async () => {
    const { sut, changePassStub } = makeSut()
    const addSpy = jest.spyOn(changePassStub, 'change')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith(1, 'any_pass')
  })

  test('Should return 500 if ChangePass throws', async () => {
    const { sut, changePassStub } = makeSut()
    jest.spyOn(changePassStub, 'change').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new ServerError('')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new ServerError('')))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok('Password changed!'))
  })
})

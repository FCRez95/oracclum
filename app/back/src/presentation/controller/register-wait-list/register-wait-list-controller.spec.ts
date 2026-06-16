
/* eslint-disable no-undef */
import { forbidden, ok, serverError } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { RegisterWaitListController } from './register-wait-list-controller'
import { AddWaitListModel, RegisterWaitList } from "../../../domain/usecases/wait-list/register-wait-list";
import { WaitListModel } from '../../../domain/models/wait-list';
import { EmailInUseError } from '../../errors';

const makeFakeAddWaitListData = () => ({
  name: 'any_name',
  email: 'any_mail',
  cel: 'any_cel'
})

const makeFakeWaitListData = () => ({
  id: 1,
  name: 'any_name',
  email: 'any_mail',
  cel: 'any_cel'
})

const makeRegisterWaitList = (): RegisterWaitList => {
  class RegisterWaitListStub implements RegisterWaitList {
    async register (addWaitList: AddWaitListModel): Promise<WaitListModel> {
      return new Promise(resolve => resolve(makeFakeWaitListData()))
    }
  }
  return new RegisterWaitListStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_mail',
    cel: 'any_cel'
  }
})

interface SutTypes {
  sut: RegisterWaitListController,
  registerWaitListStub: RegisterWaitList
}

const makeSut = (): SutTypes => {
  const registerWaitListStub = makeRegisterWaitList()
  const sut = new RegisterWaitListController(registerWaitListStub)
  return {
    sut,
    registerWaitListStub
  }
}

describe('RegisterWaitListController', () => {
  test('Should call RegisterWaitList with correct values', async () => {
    const { sut, registerWaitListStub } = makeSut()
    const updateSpy = jest.spyOn(registerWaitListStub, 'register')
    await sut.handle(makeFakeRequest())
    expect(updateSpy).toHaveBeenCalledWith(makeFakeAddWaitListData())
  })

  test('Should return 500 if RegisterWaitList throws', async () => {
    const { sut, registerWaitListStub } = makeSut()
    jest.spyOn(registerWaitListStub, 'register').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 403 if RegisterWaitList returns null', async () => {
    const { sut, registerWaitListStub } = makeSut()
    jest.spyOn(registerWaitListStub, 'register').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new EmailInUseError()))
  })

  test('Should return 200 on RegisterWaitListController success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeWaitListData()))
  })
})

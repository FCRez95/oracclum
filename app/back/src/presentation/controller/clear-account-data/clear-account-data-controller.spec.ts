import { ClearAccountData } from "../../../domain/usecases/account/clear-account-data"
import { NotFoundError } from "../../errors"
import { badRequest, ok, serverError } from "../../helpers/http-helper"
import { HttpRequest } from "../../protocols"
import { ClearAccountDataController } from "./clear-account-data-controller"

const makeClearAccountData = (): ClearAccountData => {
  class ClearAccountDataStub implements ClearAccountData {
    async clear (idUser: number): Promise<void> {
    }
  }
  return new ClearAccountDataStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1
  }
})

type SutTypes = {
  sut: ClearAccountDataController
  clearAccountDataStub: ClearAccountData
}

const makeSut = (): SutTypes => {
  const clearAccountDataStub = makeClearAccountData()
  const sut = new ClearAccountDataController(clearAccountDataStub)

  return {
    sut,
    clearAccountDataStub
  }
}

describe('ClearAccountDataController', () => {
  test('Should call ClearAccountData with correct values', async () => {
    const { sut, clearAccountDataStub } = makeSut()
    const clearSpy = jest.spyOn(clearAccountDataStub, 'clear')

    await sut.handle(makeFakeRequest())

    expect(clearSpy).toHaveBeenCalledWith(1)
  })

  test('Should return 400 if user is not found', async () => {
    const { sut, clearAccountDataStub } = makeSut()
    jest.spyOn(clearAccountDataStub, 'clear').mockResolvedValueOnce(null)

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(new NotFoundError('User')))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok('Account data deleted!'))
  })

  test('Should return 500 if ClearAccountData throws', async () => {
    const { sut, clearAccountDataStub } = makeSut()
    jest.spyOn(clearAccountDataStub, 'clear').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})

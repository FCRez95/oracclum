/* eslint-disable no-undef */
import { DeleteCampaignController } from './delete-campaign-controller'
import { ServerError } from '../../errors'
import { ChangePass } from "../../../domain/usecases/account/change-password";
import { ok, serverError, unauthorized } from "../../helpers/http-helper";
import { HttpRequest } from "../../protocols";
import { DeleteCampaign } from '../../../domain/usecases/campaign/delete-campaign';

const makeDeleteCamapaign = (): DeleteCampaign => {
  class DeleteCampaignStub implements DeleteCampaign {
    async delete (id_user: number, id_campaign: number): Promise<void | null> {
    }
  }
  return new DeleteCampaignStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idCampaign: 1,
    idUser: 1,
  }
})

interface SutTypes {
  sut: DeleteCampaignController
  deleteCampaignStub: DeleteCampaign
}

const makeSut = (): SutTypes => {
  const deleteCampaignStub = makeDeleteCamapaign()
  const sut = new DeleteCampaignController(deleteCampaignStub)
  return {
    sut,
    deleteCampaignStub
  }
}

describe('DeleteCampaignController', () => {
  test('Should call DeleteCampaign with correct values', async () => {
    const { sut, deleteCampaignStub } = makeSut()
    const addSpy = jest.spyOn(deleteCampaignStub, 'delete')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith(1, 1)
  })

  test('Should return 500 if DeleteCampaign throws', async () => {
    const { sut, deleteCampaignStub } = makeSut()
    jest.spyOn(deleteCampaignStub, 'delete').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new ServerError('')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new ServerError('')))
  })

  test('Should return 401 if DeleteCampaign returns null', async () => {
    const { sut, deleteCampaignStub } = makeSut()
    jest.spyOn(deleteCampaignStub, 'delete').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok('Campaign deleted!'))
  })
})

/* eslint-disable no-undef */
import { ok } from '../../helpers/http-helper'
import { EditCampaignLinkController } from './edit-campaign-link-controller'
import { HttpRequest, EditCampaign, CampaignModel } from './edit-campaign-controller-protocols'



const makeEditCampaignLink = (): EditCampaign => {
    class editCampaignStub implements EditCampaign {
        async edit(id_campaign: number, link: string, user_id: number): Promise<CampaignModel | null> {
            return new Promise(resolve => resolve(makeFakeCampaign()))
        }
    }
    return new editCampaignStub()
}


const makeFakeCampaign = () => ({
    id: 1,
    id_user: 1,
    name: 'any_name',
    link: 'any_link',
    ad_provider: 'any_provider',
    total_clicks: 0,
    total_sales: 0,
    revenue: 0,
    expenses: 0,
    total_checkout: 0,
    click_auth: 'any_token'
})

const makeFakeRequest = (): HttpRequest => ({
    body: {
        idCampaign: 1,
        link: "new_link",
        id_user: 1,
    }
})

interface SutTypes {
    sut: EditCampaignLinkController,
    editCampaignStub: EditCampaign,
}

const makeSut = (): SutTypes => {
    const editCampaignStub = makeEditCampaignLink()
    const sut = new EditCampaignLinkController(editCampaignStub)
    return {
        sut,
        editCampaignStub,
    }
}

describe('Edit Campaign Controller', () => {
    test('Should call EditCampaign with correct values', async () => {
        const { sut, editCampaignStub } = makeSut()
        const authSpy = jest.spyOn(editCampaignStub, 'edit')
        await sut.handle(makeFakeRequest())
        expect(authSpy).toHaveBeenCalledWith(
            1,
            'new_link',
            1,
        )
    })


    test('Should return 200 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(ok(makeFakeCampaign()))
    })
    test('Should return 500 if EditCampaign throws', async () => {
        const { sut, editCampaignStub } = makeSut()
        jest.spyOn(editCampaignStub, 'edit').mockRejectedValueOnce(new Error())
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse.statusCode).toBe(500)
    })
})


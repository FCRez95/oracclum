/* eslint-disable no-undef */
import { ok, badRequest } from '../../helpers/http-helper'
import { EditCampaignController } from './edit-campaign-controller'
import { HttpRequest, EditCampaign, EditCampaignData, CampaignModel, Validation } from './edit-campaign-controller-protocols'
import { MissingParamError } from '../../errors'


const makeEditCampaign = (): EditCampaign => {
    class editCampaignStub implements EditCampaign {
        async edit(id_campaign: number, data: EditCampaignData, id_user: number): Promise<CampaignModel | null> {
            return new Promise(resolve => resolve(makeFakeCampaign()))
        }
    }
    return new editCampaignStub()
}

const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
        validate(input: any): Error {
            return null
        }
    }
    return new ValidationStub()
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
        name: "new_name",
        link: "new_link",
        ad_provider: "new_provider",
        conversion_name: "new_conversion",
        checkout_provider: "new_checkout",
        external_id: "new_ext_id",
        sub_account: "new_sub",
        id_user: 1,
    }
})

interface SutTypes {
    sut: EditCampaignController,
    editCampaignStub: EditCampaign,
    validationStub: Validation,
}

const makeSut = (): SutTypes => {
    const editCampaignStub = makeEditCampaign()
    const validationStub = makeValidation()
    const sut = new EditCampaignController(editCampaignStub, validationStub)
    return {
        sut,
        editCampaignStub,
        validationStub,
    }
}

describe('Edit Campaign Controller', () => {
    test('Should call EditCampaign with correct values', async () => {
        const { sut, editCampaignStub } = makeSut()
        const authSpy = jest.spyOn(editCampaignStub, 'edit')
        await sut.handle(makeFakeRequest())
        expect(authSpy).toHaveBeenCalledWith(
            1,
            {
                name: 'new_name',
                link: 'new_link',
                ad_provider: 'new_provider',
                conversion_name: 'new_conversion',
                checkout_provider: 'new_checkout',
                external_id: 'new_ext_id',
                sub_account: 'new_sub',
            },
            1
        )
    })

    test('Should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut()
        const validateSpy = jest.spyOn(validationStub, 'validate')
        const httpRequest = makeFakeRequest()
        await sut.handle(httpRequest)
        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
    })

    test('Should return 400 if Validation fails', async () => {
        const { sut, validationStub } = makeSut()
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('name'))
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(badRequest(new MissingParamError('name')))
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


import { EditCampaignRepository } from "../../protocols/db/campaign/edit-campaign-repository"
import { CampaignModel } from "../add-campaign/db-add-campaign-protocols"
import { DbEditCampaign } from './db-edit-campaign'
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { UnauthorizedError } from "../../../presentation/errors";
import { EditCampaignData } from "../../../domain/usecases/campaign/edit-campaign";

const makeFakeCampaign = () => ({
    id: 2,
    id_user: 1,
    name: 'any_name',
    link: 'any_link',
    ad_provider: 'any_provider',
    total_clicks: 0,
    total_sales: 0,
    expenses: 0,
    total_checkout: 0,
    revenue: 0,
    click_auth: 'any_token'
})

const makeFakeData = (): EditCampaignData => ({
    name: 'new_name',
    link: 'new_link',
    ad_provider: 'new_provider',
    conversion_name: 'new_conversion',
    checkout_provider: 'new_checkout',
    external_id: 'new_ext_id',
})

const makeEditCampaignRepository = (): EditCampaignRepository => {
    class EditCampaignRepositoryStub implements EditCampaignRepository {
        async editCampaign(id_campaign: number, data: EditCampaignData): Promise<void | null> {

        }
    }
    return new EditCampaignRepositoryStub()

}

const makeLoadCampaignRepository = (): LoadCampaignRepository => {
    class LoadCampaignRepositoryStub implements LoadCampaignRepository {
        async loadCampaign(id_campaign: number): Promise<CampaignModel> {
            return new Promise(resolve => resolve(makeFakeCampaign()))
        }
    }
    return new LoadCampaignRepositoryStub()
}


interface SutTypes {
    sut: DbEditCampaign
    loaderStub: LoadCampaignRepository
    editCampaignRepositoryStub: EditCampaignRepository
}

const makeSut = (): SutTypes => {
    const loaderStub = makeLoadCampaignRepository()
    const editCampaignRepositoryStub = makeEditCampaignRepository()
    const sut = new DbEditCampaign(loaderStub, editCampaignRepositoryStub)
    return {
        sut,
        loaderStub,
        editCampaignRepositoryStub,
    }
}

describe('DbEditCampaign', () => {
    describe('LoadCampaignRepository', () => {
        test('Should call LoadCampaignRepository with correct values', async () => {
            const { sut, loaderStub } = makeSut()
            const loadCampaignsSpy = jest.spyOn(loaderStub, 'loadCampaign')
            await sut.edit(2, makeFakeData(), 1)
            expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
        })
        test('Should throw if LoadCampaignRepository throws', async () => {
            const { sut, loaderStub } = makeSut()
            jest.spyOn(loaderStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
            const promise = sut.edit(1, makeFakeData(), 1)
            await expect(promise).rejects.toThrow()
        })
    })
    describe('EditCampaignRepository', () => {
        test('Should call EditCampaign with correct values', async () => {
            const { sut, editCampaignRepositoryStub, loaderStub } = makeSut()
            const loadCampaignsSpy = jest.spyOn(loaderStub, 'loadCampaign')
            const editCampaignRepositoryStubSpy = jest.spyOn(editCampaignRepositoryStub, 'editCampaign')
            await sut.edit(2, makeFakeData(), 1)
            expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
            expect(editCampaignRepositoryStubSpy).toBeCalledWith(2, makeFakeData())
        })

        test('Should return error if user_id different', async () => {
            const { sut } = makeSut()
            await expect(sut.edit(2, makeFakeData(), 4)).rejects.toThrow(UnauthorizedError)
        })
    })
})

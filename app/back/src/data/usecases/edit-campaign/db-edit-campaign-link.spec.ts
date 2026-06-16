import { EditCampaignLinkRepository } from "../../protocols/db/campaign/edit-campaign-repository"
import { CampaignModel } from "../add-campaign/db-add-campaign-protocols"
import { DbEditCampaignLink } from './db-edit-campaign-link'
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { UnauthorizedError } from "../../../presentation/errors";

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

const makeEditCampaignLinkRepository = (): EditCampaignLinkRepository => {
    class EditCampaignLinkRepositoryStub implements EditCampaignLinkRepository {
        async editCampaignLink(id_campaign: number, new_link: string): Promise<void | null> {

        }
    }
    return new EditCampaignLinkRepositoryStub()

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
    sut: DbEditCampaignLink
    loaderStub: LoadCampaignRepository
    editCampaignLinkRepositoryStub: EditCampaignLinkRepository
}

const makeSut = (): SutTypes => {
    const loaderStub = makeLoadCampaignRepository()
    const editCampaignLinkRepositoryStub = makeEditCampaignLinkRepository()
    const sut = new DbEditCampaignLink(loaderStub, editCampaignLinkRepositoryStub)
    return {
        sut,
        loaderStub,
        editCampaignLinkRepositoryStub,
    }
}

describe('DbEditCampaignLink', () => {
    describe('LoadCampaignRepository', () => {
        test('Should call LoadCampaignRepository with correct values', async () => {
            const { sut, loaderStub } = makeSut()
            const loadCampaignsSpy = jest.spyOn(loaderStub, 'loadCampaign')
            await sut.edit(2, "new_name", 1)
            expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
        })
        test('Should throw if LoadCampaignRepository throws', async () => {
            const { sut, loaderStub } = makeSut()
            jest.spyOn(loaderStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
            const promise = sut.edit(1, "new_name", 1)
            await expect(promise).rejects.toThrow()
        })
    })
    describe('EditCampaignLinkRepository', () => {
        test('Should call EditCampaignLink with correct values', async () => {
            const { sut, editCampaignLinkRepositoryStub, loaderStub } = makeSut()
            const loadCampaignsSpy = jest.spyOn(loaderStub, 'loadCampaign')
            const editCampaignLinkRepositoryStubSpy = jest.spyOn(editCampaignLinkRepositoryStub, 'editCampaignLink')
            await sut.edit(2, "new_link", 1)
            expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
            expect(editCampaignLinkRepositoryStubSpy).toBeCalledWith(2, "new_link")
        })
    })
    test('Should return error if user_id different', async () => {
        const { sut, editCampaignLinkRepositoryStub, loaderStub } = makeSut()
        const loadCampaignsSpy = jest.spyOn(loaderStub, 'loadCampaign')
        const editCampaignRepositoryStubSpy = jest.spyOn(editCampaignLinkRepositoryStub, 'editCampaignLink')
        await expect(sut.edit(2, "new_name", 4)).rejects.toThrow(UnauthorizedError)
    })
})

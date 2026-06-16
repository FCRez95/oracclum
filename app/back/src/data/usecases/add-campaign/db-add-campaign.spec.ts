/* eslint-disable no-undef */
import { CampaignModel, Hasher, AddCampaignRepository} from './db-add-campaign-protocols'
import { DbAddCampaign } from './db-add-campaign'
import { RegisterClickAuth } from '../../protocols/external-apis/clicks-api'

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return new Promise(resolve => resolve('click_auth'))
    }
  }
  return new HasherStub()
}

const makeAddCampaignRepository = (): AddCampaignRepository => {
  class AddAcountRepositoryStub implements AddCampaignRepository {
    async add (
      name: string,
      link: string,
      idUser: number,
      clickAuth: string,
      ad_provider: string,
      conversion_name: string,
      checkout_provider: string,
      external_id: string,
      sub_account?: string
    ): Promise<CampaignModel> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new AddAcountRepositoryStub()
}

const makeFakeCampaign = () => ({
  id: 1,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'meta',
  conversion_name: 'any_conversion',
  checkout_provider: 'any_checkout',
  external_id: 'any_external_id',
  total_clicks: 0,
  total_sales: 0,
  expenses: 0,
  total_checkout: 0,
  revenue: 0,
  click_auth: 'any_token'
})

const makeRegisterClickAuth = (): RegisterClickAuth => {
  class RegisterClickAuthStub implements RegisterClickAuth {
    async register (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
    }
  }
  return new RegisterClickAuthStub()
}

interface SutTypes {
  sut: DbAddCampaign
  addCampaignRepositoryStub: AddCampaignRepository
  hasherStub: Hasher
  registerClickAuthStub: RegisterClickAuth
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addCampaignRepositoryStub = makeAddCampaignRepository()
  const registerClickAuthStub = makeRegisterClickAuth()
  const sut = new DbAddCampaign(hasherStub, addCampaignRepositoryStub, registerClickAuthStub)
  return {
    sut,
    addCampaignRepositoryStub,
    hasherStub,
    registerClickAuthStub,
  }
}

describe('DbAddCampaign', () => {
  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.add('any_name', 'any_link', 1, 'any_provider', 'any_conversion', 'any_checkout', 'any_external_id')
    await expect(promise).rejects.toThrow()
  })

  describe('AddCampaignRepository', () => {
    test('Should call AddCampaignRepository with correct values', async () => {
      const { sut, addCampaignRepositoryStub } = makeSut()
      const addSpy = jest.spyOn(addCampaignRepositoryStub, 'add')
      await sut.add('any_name', 'any_link', 1, 'any_provider', 'any_conversion', 'any_checkout', 'any_external_id', 'sub_conta')
      expect(addSpy).toHaveBeenCalledWith('any_name', 'any_link', 1, 'click_auth', 'any_provider', 'any_conversion', 'any_checkout', 'any_external_id', 'sub_conta')
    })
  
    test('Should throw if AddCampaignRepository throws', async () => {
      const { sut, addCampaignRepositoryStub } = makeSut()
      jest.spyOn(addCampaignRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.add('any_name', 'any_link', 1, 'any_provider', 'any_conversion', 'any_checkout', 'any_external_id')
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const campaign = await sut.add('any_name', 'any_link', 1, 'any_provider', 'any_conversion', 'any_checkout', 'any_external_id')
    expect(campaign).toEqual(makeFakeCampaign())
  })

  test('Should register click auth with campaign provider', async () => {
    const { sut, registerClickAuthStub } = makeSut()
    const registerSpy = jest.spyOn(registerClickAuthStub, 'register')
    await sut.add('any_name', 'any_link', 1, 'meta', 'any_conversion', 'any_checkout', 'any_external_id')
    expect(registerSpy).toHaveBeenCalledWith('click_auth', 1, 'meta')
  })
})

/* eslint-disable no-undef */
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from "../../helpers/http-helper";
import { LoadUserCampaignsController } from "./load-user-campaigns-controller";
import {
  HttpRequest,
  Validation,
  LoadUserCampaigns,
  CampaignSummaryModel,
} from "./load-user-campaigns-controller-protocols";

const makeFakeCampaignSummary = () => ({
  id: 1,
  id_user: 1,
  name: "any_name",
  external_id: 1,
  ad_provider: "taboola",
  expenses: 0,
  revenue: 0,
  expensesToday: 0,
  revenueToday: 0,
  clicks: 0,
  sales: 0,
  checkout: 0,
  roas: 0,
  clicksToday: 0,
  checkoutToday: 0,
  salesToday: 0,
  roasToday: 0,
});

const makeLoadUserCampaign = (): LoadUserCampaigns => {
  class LoadUserCampaignsStub implements LoadUserCampaigns {
    async load(idUser: number): Promise<CampaignSummaryModel[] | null> {
      return new Promise((resolve) => resolve([makeFakeCampaignSummary()]));
    }
    async loadByDateRange(id_user: number, dateRange: { startDate: string; endDate: string; }): Promise<CampaignSummaryModel[] | null> {
      return new Promise((resolve) => resolve([makeFakeCampaignSummary()]))
    }
  }
  return new LoadUserCampaignsStub();
};

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1,
  },
});

interface SutTypes {
  sut: LoadUserCampaignsController;
  loadUserCampaignsStub: LoadUserCampaigns;
}

const makeSut = (): SutTypes => {
  const loadUserCampaignsStub = makeLoadUserCampaign();
  const sut = new LoadUserCampaignsController(loadUserCampaignsStub);
  return {
    sut,
    loadUserCampaignsStub,
  };
};

describe("Load User Campaigns Controller", () => {
  test("Should call LoadUserCampaigns with correct values", async () => {
    const { sut, loadUserCampaignsStub } = makeSut();
    const authSpy = jest.spyOn(loadUserCampaignsStub, "load");
    await sut.handle(makeFakeRequest());
    expect(authSpy).toHaveBeenCalledWith(1);
  });

  test("Should return 500 if LoadUserCampaigns throws", async () => {
    const { sut, loadUserCampaignsStub } = makeSut();
    jest.spyOn(loadUserCampaignsStub, "load").mockImplementationOnce(() => {
      throw new Error();
    });
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(serverError(new Error()));
  });

  test("Should return 200 if LoadUserCampaigns returns a campaign", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.handle(makeFakeRequest());
    const ass = ok({ newCampaign: makeFakeCampaignSummary() });
    expect(httpResponse).toEqual(ok([makeFakeCampaignSummary()]));
  });

  test("Should return 504 if taboola takes to long to answer", async () => {
    const { sut, loadUserCampaignsStub } = makeSut()
    jest.spyOn(loadUserCampaignsStub, 'load').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  });

  test('Should return 429 if LoadAccountByToken returns a Taboola too many requests', async () => {
    const { sut, loadUserCampaignsStub } = makeSut()
    jest.spyOn(loadUserCampaignsStub, 'load').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(429)
  })

});

/* eslint-disable no-undef */
import { DbLoadCampaignSitesSummary } from "./db-load-campaign-sites-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadOptimizationDataRepository, OptimizationDataBySite } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { CampaignModel } from "../../../domain/models/campaign";
import { OptimizationData } from "../../../domain/models/optimization-data";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import {
  ExternalSiteInfo,
  GetExternalSitesInfo,
} from "../../protocols/external-apis/external-info";

const makeFakeCampaign = () => ({
  id: 2,
  id_user: 1,
  name: "any_name",
  link: "any_link",
  ad_provider: "any_provider",
  total_clicks: 0,
  expenses: 0,
  total_checkout: 0,
  total_sales: 0,
  revenue: 0,
  click_auth: "any_token",
});

const makeFakeCampaignSite = () => ({
  id_campaign: 1,
  id_campaign_taboola: 1,
  id_site: "1",
  site: "any_name",
  target: "any_target",
  summary: makeFakeOptimizeData(),
});

const makeFakeOptimizeData = () => ({
  revenue: 100,
  expenses: 50,
  cpc: 0.4,
  vcpm: 0.9,
  cpa: 20,
  vctr: 20,
  clicks: 1,
  checkout: 10,
  sales: 5,
  roas: 5
})

const makeFakeInternalOptimizationData = () => ({
  revenue: 100,
  checkout: 10,
  sales: 5,
})

const makeFakeExternalInfo = () => ({
  id_taboola: 1,
  name: "any_name",
  site: "any_target",
  expenses: 1,
  clicks: 1,
  vcpm: 0.9,
  vctr: 20,
  cpc: 0.4,
});

const makeLoadCampaignRepository = (): LoadCampaignRepository => {
  class LoadCampaignRepositoryStub implements LoadCampaignRepository {
    async loadCampaign(id_campaign: number): Promise<CampaignModel> {
      return new Promise((resolve) => resolve(makeFakeCampaign()));
    }
  }
  return new LoadCampaignRepositoryStub();
};

const makeGetIdCampaignTaboolaRepository =
  (): GetIdCampaignTaboolaRepository => {
    class GetIdCampaignTaboolaRepositoryStub
      implements GetIdCampaignTaboolaRepository
    {
      async getTaboolaId(id_campaign: number): Promise<number> {
        return new Promise((resolve) => resolve(1));
      }

      async getTaboolaIds(id_campaigns: number[]): Promise<Array<{ id_campaign: number; id_campaign_taboola: number | string }>> {
        return Promise.resolve([{ id_campaign: 2, id_campaign_taboola: 1 }])
      }
    }
    return new GetIdCampaignTaboolaRepositoryStub();
  };

const makeLoadOptimizationDataRepository =
  (): LoadOptimizationDataRepository => {
    class LoadOptimizationDataRepositoryStub
      implements LoadOptimizationDataRepository
    {
      async load(): Promise<OptimizationData> {
        return new Promise((resolve) => resolve(makeFakeOptimizeData()));
      }

      async loadByDateRange(): Promise<OptimizationData> {
        return new Promise((resolve) => resolve(makeFakeOptimizeData()));
      }

      async loadAdsSummariesByIds(): Promise<any[]> {
        return Promise.resolve([])
      }

      async loadAdsSummariesByIdsByDateRange(): Promise<any[]> {
        return Promise.resolve([])
      }

      async loadSitesSummariesByCampaignAndIds(): Promise<OptimizationDataBySite[]> {
        return Promise.resolve([{ id_site: "1", ...makeFakeInternalOptimizationData() }])
      }

      async loadSitesSummariesByCampaignAndIdsByDateRange(): Promise<OptimizationDataBySite[]> {
        return Promise.resolve([{ id_site: "1", ...makeFakeInternalOptimizationData() }])
      }
    }
    return new LoadOptimizationDataRepositoryStub();
  };

const makeGetExternalInfo = (): GetExternalSitesInfo => {
  class GetExternalSitesInfoStub implements GetExternalSitesInfo {
    async getExternalSitesInfo(
      id_user: number,
      id_campaign_taboola: number,
      days: number
    ): Promise<ExternalSiteInfo[]> {
      return new Promise((resolve) => resolve([makeFakeExternalInfo()]));
    }

    async getExternalSitesInfoByDateRange(
      id_user: number,
      id_campaign_taboola: number,
      dateRange: { startDate: string; endDate: string }
    ): Promise<ExternalSiteInfo[]> {
      return new Promise((resolve) => resolve([makeFakeExternalInfo()]));
    }
  }
  return new GetExternalSitesInfoStub();
};

interface SutTypes {
  sut: DbLoadCampaignSitesSummary;
  getIdCampaignTaboolaRepositoryStub: GetIdCampaignTaboolaRepository;
  loadCampaignRepositoryStub: LoadCampaignRepository;
  loadOptimizationDataRepositoryStub: LoadOptimizationDataRepository;
  getExternalSitesInfoStub: GetExternalSitesInfo;
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository();
  const getIdCampaignTaboolaRepositoryStub =
    makeGetIdCampaignTaboolaRepository();
  const loadOptimizationDataRepositoryStub =
    makeLoadOptimizationDataRepository();
  const getExternalSitesInfoStub = makeGetExternalInfo();

  const sut = new DbLoadCampaignSitesSummary(
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalSitesInfoStub
  );
  return {
    sut,
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalSitesInfoStub,
  };
};

describe("DbLoadCampaignSitesSummary usecase", () => {
  describe("loadAllSites", () => {
    describe("LoadCampaignRepository", () => {
      test("Should call LoadCampaignRepository with correct values", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignRepositoryStub,
          "loadCampaign"
        );
        await sut.loadAllSites(1, 1, 0);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if LoadCampaignRepository throws", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadAllSites(1, 1, 0);
        await expect(promise).rejects.toThrow();
      });

      test("Should return null if LoadCampaignRepository returns null", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
        const adsSummary = await sut.loadAllSites(1, 1, 0);
        expect(adsSummary).toBeNull();
      });
    });

    describe("GetIdCampaignTaboolaRepository", () => {
      test("Should call GetIdCampaignTaboolaRepository with correct values", async () => {
        const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          getIdCampaignTaboolaRepositoryStub,
          "getTaboolaId"
        );
        await sut.loadAllSites(1, 2, 1);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(2);
      });

      test("Should throw if GetIdCampaignTaboolaRepository throws", async () => {
        const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut();
        jest
          .spyOn(getIdCampaignTaboolaRepositoryStub, "getTaboolaId")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadAllSites(1, 2, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("GetExternalSitesInfo", () => {
      test("Should call GetExternalSitesInfo with correct values", async () => {
        const { sut, getExternalSitesInfoStub } = makeSut();
        const loadSpy = jest.spyOn(
          getExternalSitesInfoStub,
          "getExternalSitesInfo"
        );
        await sut.loadAllSites(1, 1, 1);
        expect(loadSpy).toHaveBeenCalledWith(1, 1, 1);
      });

      test("Should throw if GetExternalSitesInfo throws", async () => {
        const { sut, getExternalSitesInfoStub } = makeSut();
        jest
          .spyOn(getExternalSitesInfoStub, "getExternalSitesInfo")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadAllSites(1, 2, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("LoadOptimizationDataRepository", () => {
      test("Should call LoadOptimizationDataRepository with correct values", async () => {
        const { sut, loadOptimizationDataRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(loadOptimizationDataRepositoryStub, 'loadSitesSummariesByCampaignAndIds')
        await sut.loadAllSites(1, 1, 0)
        expect(loadSpy).toHaveBeenCalledWith(0, 1, [1])
      })
    })

    test('Should return site data without internal info if LoadOptimizationDataRepository throws', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadOptimizationDataRepositoryStub, 'loadSitesSummariesByCampaignAndIds').mockImplementationOnce(() => Promise.reject(new Error()))
      await expect(sut.loadAllSites(1,1,0)).rejects.toThrow()
    })
  })

  test('Should return a CampaignSiteSummary[] on success', async () => {
    const { sut } = makeSut()
    const result = await sut.loadAllSites(1,1,0)
    expect(result).toEqual([
      {
        id_campaign: 1,
        id_campaign_taboola: 1,
        id_site: '1',
        site: 'any_name',
        target: 'any_target',
        summary: {
          revenue: 100,
          expenses: 1,
          vcpm: 0.9,
          cpa: 0.2,
          cpc: 0.4,
          vctr: 20,
          clicks: 1,
          checkout: 10,
          sales: 5,
          roas: 100
        }
      }
    ])
  })
})

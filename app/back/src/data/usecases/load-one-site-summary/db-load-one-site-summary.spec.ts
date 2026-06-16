/* eslint-disable no-undef */
import { DbLoadOneSiteSummary } from "./db-load-one-site-summary";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { LoadOptimizationDataRepository } from "../../protocols/db/clicks-taboola/load-optimization-data-repository";
import { CampaignModel } from "../../../domain/models/campaign";
import { OptimizationData } from "../../../domain/models/optimization-data";
import { GetIdCampaignTaboolaRepository } from "../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository";
import {
  GetExternalSiteInfo,
  ExternalSiteInfo,
} from "../../protocols/external-apis/external-info";

const makeFakeCampaign = () => ({
  id: 1,
  id_user: 1,
  name: "any_name",
  link: "any_link",
  ad_provider: "any_provider",
  total_clicks: 0,
  total_sales: 0,
  revenue: 0,
  expenses: 0,
  total_checkout: 0,
  click_auth: "any_token",
});

const makeFakeOptimizeData = () => ({
  revenue: 0,
  expenses: 1,
  cpc: 0.4,
  vcpm: 0.9,
  cpa: 0,
  vctr: 20,
  clicks: 12,
  checkout: 0,
  sales: 0,
  roas: 0,
});

const makeFakeExternalInfo = () => ({
  id_taboola: 1,
  name: "any_name",
  site: "any_site",
  expenses: 1,
  clicks: 12,
  vcpm: 0.9,
  vctr: 20,
  cpc: 0.4,
});

const makeFakeReturn = () => ({
  revenue: makeFakeOptimizeData().revenue,
  expenses: makeFakeExternalInfo().expenses,
  cpc: makeFakeExternalInfo().cpc,
  vcpm: makeFakeExternalInfo().vcpm,
  cpa:
    makeFakeOptimizeData().sales > 0
      ? makeFakeExternalInfo().expenses / makeFakeOptimizeData().sales
      : 0,
  vctr: makeFakeExternalInfo().vctr,
  clicks: makeFakeExternalInfo().clicks,
  checkout: makeFakeOptimizeData().checkout,
  sales: makeFakeOptimizeData().sales,
  roas:
    makeFakeExternalInfo().expenses > 0
      ? makeFakeOptimizeData().revenue / makeFakeExternalInfo().expenses
      : 0,
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
        return Promise.resolve([{ id_campaign: 1, id_campaign_taboola: 1 }])
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

      async loadSitesSummariesByCampaignAndIds(): Promise<any[]> {
        return Promise.resolve([])
      }

      async loadSitesSummariesByCampaignAndIdsByDateRange(): Promise<any[]> {
        return Promise.resolve([])
      }
    }
    return new LoadOptimizationDataRepositoryStub();
  };

const makeGetExternalSiteInfo = (): GetExternalSiteInfo => {
  class GetExternalSiteInfoStub implements GetExternalSiteInfo {
    async getExternalSiteInfo(
      id_user: number,
      id_campaign_taboola: number,
      id_site: number,
      days: number
    ): Promise<ExternalSiteInfo> {
      return new Promise((resolve) => resolve(makeFakeExternalInfo()));
    }

    async getExternalSiteInfoByDateRange(
      id_user: number,
      id_campaign_taboola: number,
      id_site: number,
      dateRange: { startDate: string; endDate: string }
    ): Promise<ExternalSiteInfo> {
      return new Promise((resolve) => resolve(makeFakeExternalInfo()));
    }
  }
  return new GetExternalSiteInfoStub();
};

interface SutTypes {
  sut: DbLoadOneSiteSummary;
  loadCampaignRepositoryStub: LoadCampaignRepository;
  getIdCampaignTaboolaRepositoryStub: GetIdCampaignTaboolaRepository;
  loadOptimizationDataRepositoryStub: LoadOptimizationDataRepository;
  getExternalSiteInfoStub: GetExternalSiteInfo;
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository();
  const getIdCampaignTaboolaRepositoryStub =
    makeGetIdCampaignTaboolaRepository();
  const loadOptimizationDataRepositoryStub =
    makeLoadOptimizationDataRepository();
  const getExternalSiteInfoStub = makeGetExternalSiteInfo();

  const sut = new DbLoadOneSiteSummary(
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalSiteInfoStub
  );
  return {
    sut,
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalSiteInfoStub,
  };
};

describe("DbLoadOneSiteSummary usecase", () => {
  describe("loadOne", () => {
    describe("LoadCampaignRepository", () => {
      test("Should call LoadCampaignRepository with correct values", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignRepositoryStub,
          "loadCampaign"
        );
        await sut.loadOne(1, 1, 1, 1);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if LoadCampaignRepository throws", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOne(1, 1, 1, 1);
        await expect(promise).rejects.toThrow();
      });

      test("Should return null if LoadCampaignRepository returns null", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
        const adsSummary = await sut.loadOne(1, 1, 1, 1);
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
        await sut.loadOne(1, 1, 1, 1);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if GetIdCampaignTaboolaRepository throws", async () => {
        const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut();
        jest
          .spyOn(getIdCampaignTaboolaRepositoryStub, "getTaboolaId")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOne(1, 1, 1, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("LoadOptimizationDataRepository", () => {
      test("Should call LoadOptimizationDataRepository with correct values", async () => {
        const { sut, loadOptimizationDataRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(loadOptimizationDataRepositoryStub, "load");
        await sut.loadOne(1, 1, 1, 1);
        expect(loadSpy).toHaveBeenCalledWith(1, 1, undefined, 1);
      });

      test("Should throw if LoadAllAdsRepository throws", async () => {
        const { sut, loadOptimizationDataRepositoryStub } = makeSut();
        jest
          .spyOn(loadOptimizationDataRepositoryStub, "load")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOne(1, 1, 1, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("GetExternalSiteInfo", () => {
      test("Should call GetExternalSiteInfo with correct values", async () => {
        const { sut, getExternalSiteInfoStub } = makeSut();
        const loadSpy = jest.spyOn(
          getExternalSiteInfoStub,
          "getExternalSiteInfo"
        );
        await sut.loadOne(1, 1, 1, 1);
        expect(loadSpy).toHaveBeenCalledWith(1, 1, 1, 1);
      });

      test("Should throw if GetExternalSiteInfo throws", async () => {
        const { sut, getExternalSiteInfoStub } = makeSut();
        jest
          .spyOn(getExternalSiteInfoStub, "getExternalSiteInfo")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOne(1, 1, 1, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    test("Should return a OptimizationData on success", async () => {
      const { sut } = makeSut();
      const summaryAds = await sut.loadOne(1, 1, 1, 0);
      expect(summaryAds).toEqual(makeFakeReturn());
    });
  });

  describe("loadOneByDateRange", () => {
    const dateRange = { startDate: "2023-01-01", endDate: "2023-01-07" };

    describe("LoadCampaignRepository", () => {
      test("Should call LoadCampaignRepository with correct values", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignRepositoryStub,
          "loadCampaign"
        );
        await sut.loadOneByDateRange(1, 1, 1, dateRange);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if LoadCampaignRepository throws", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOneByDateRange(1, 1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });

      test("Should return null if LoadCampaignRepository returns null", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
        const adsSummary = await sut.loadOneByDateRange(1, 1, 1, dateRange);
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
        await sut.loadOneByDateRange(1, 1, 1, dateRange);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if GetIdCampaignTaboolaRepository throws", async () => {
        const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut();
        jest
          .spyOn(getIdCampaignTaboolaRepositoryStub, "getTaboolaId")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOneByDateRange(1, 1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("LoadOptimizationDataRepository", () => {
      test("Should call loadByDateRange with correct values", async () => {
        const { sut, loadOptimizationDataRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(
          loadOptimizationDataRepositoryStub,
          "loadByDateRange"
        );
        await sut.loadOneByDateRange(1, 1, 1, dateRange);
        expect(loadSpy).toHaveBeenCalledWith(dateRange, 1, undefined, 1);
      });

      test("Should throw if loadByDateRange throws", async () => {
        const { sut, loadOptimizationDataRepositoryStub } = makeSut();
        jest
          .spyOn(loadOptimizationDataRepositoryStub, "loadByDateRange")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOneByDateRange(1, 1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });
    });

    describe("GetExternalSiteInfo", () => {
      test("Should call getExternalSiteInfoByDateRange with correct values", async () => {
        const { sut, getExternalSiteInfoStub } = makeSut();
        const loadSpy = jest.spyOn(
          getExternalSiteInfoStub,
          "getExternalSiteInfoByDateRange"
        );
        await sut.loadOneByDateRange(1, 1, 1, dateRange);
        expect(loadSpy).toHaveBeenCalledWith(1, 1, 1, dateRange);
      });

      test("Should throw if getExternalSiteInfoByDateRange throws", async () => {
        const { sut, getExternalSiteInfoStub } = makeSut();
        jest
          .spyOn(getExternalSiteInfoStub, "getExternalSiteInfoByDateRange")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadOneByDateRange(1, 1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });
    });

    test("Should return OptimizationData on success", async () => {
      const { sut } = makeSut();
      const summaryAds = await sut.loadOneByDateRange(1, 1, 1, dateRange);
      expect(summaryAds).toEqual(makeFakeReturn());
    });
  });
});

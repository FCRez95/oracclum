/* eslint-disable no-undef */
import { DbLoadCampaignStepsByTime } from "./db-load-campaign-steps-by-time";
import { CampaignModel } from "../add-campaign/db-add-campaign-protocols";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import {
  CampaignStepsData,
  LoadCampaignStepsSummaryByClicksRepository,
} from "../../protocols/db/campaign/load-campaign-steps-summary-by-clicks-repository";

const makeFakeCampaign = () => ({
  id: 2,
  id_user: 1,
  name: "any_name",
  link: "any_link",
  ad_provider: "any_provider",
  click_auth: "any_token",
});

const makeFakeCampaignSummary = () => ({
  id: 1,
  name: "any_name",
  link: "any_link",
  number_redirects: 1,
  total_clicks: 1,
  total_sales: 1,
  revenue: 1,
  total_step_1: 1,
  step_1_views: 1,
  total_step_2: 1,
  step_2_views: 1,
  total_step_3: 1,
  step_3_views: 1,
  total_checkout: 1,
  checkout_views: 1,
});

const makeLoadCampaignRepository = (): LoadCampaignRepository => {
  class LoadCampaignRepositoryStub implements LoadCampaignRepository {
    async loadCampaign(id_campaign: number): Promise<CampaignModel> {
      return new Promise((resolve) => resolve(makeFakeCampaign()));
    }
  }
  return new LoadCampaignRepositoryStub();
};

const makeloadCampaignStepsSummaryByClicksRepository =
  (): LoadCampaignStepsSummaryByClicksRepository => {
    class LoadCampaignStepsSummaryByClicksRepositoryStub
      implements LoadCampaignStepsSummaryByClicksRepository
    {
      async loadCampaignSummaryByClick(
        idCampaign: number,
        days: number
      ): Promise<CampaignStepsData> {
        return new Promise((resolve) => resolve(makeFakeCampaignSummary()));
      }

      async loadCampaignSummaryByClickByDateRange(
        idCampaign: number,
        dateRange: { startDate: string; endDate: string }
      ): Promise<CampaignStepsData> {
        return new Promise((resolve) => resolve(makeFakeCampaignSummary()));
      }
    }
    return new LoadCampaignStepsSummaryByClicksRepositoryStub();
  };

interface SutTypes {
  sut: DbLoadCampaignStepsByTime;
  loadCampaignRepositoryStub: LoadCampaignRepository;
  loadCampaignStepsSummaryByClicksRepositoryStub: LoadCampaignStepsSummaryByClicksRepository;
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository();
  const loadCampaignStepsSummaryByClicksRepositoryStub =
    makeloadCampaignStepsSummaryByClicksRepository();
  const sut = new DbLoadCampaignStepsByTime(
    loadCampaignRepositoryStub,
    loadCampaignStepsSummaryByClicksRepositoryStub
  );
  return {
    sut,
    loadCampaignRepositoryStub,
    loadCampaignStepsSummaryByClicksRepositoryStub,
  };
};

describe("DbLoadFunnelsByTime usecase", () => {
  describe("load", () => {
    describe("LoadCampaignRepository", () => {
      test("Should call LoadCampaignRepository with correct values", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignRepositoryStub,
          "loadCampaign"
        );
        await sut.load(1, 1, 1);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if LoadCampaignRepository throws", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.load(1, 1, 1);
        await expect(promise).rejects.toThrow();
      });

      test("Should return null if LoadCampaignRepository returns null", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
        const funnels = await sut.load(1, 1, 1);
        expect(funnels).toBeNull();
      });
    });

    describe("LoadFunnelSummaryByClicksRepository", () => {
      test("Should call LoadFunnelSummaryByClicksRepository with correct values", async () => {
        const { sut, loadCampaignStepsSummaryByClicksRepositoryStub } =
          makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignStepsSummaryByClicksRepositoryStub,
          "loadCampaignSummaryByClick"
        );
        await sut.load(1, 1, 1);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(
          makeFakeCampaignSummary().id,
          1
        );
      });

      test("Should throw if LoadFunnelSummaryByClicksRepository throws", async () => {
        const { sut, loadCampaignStepsSummaryByClicksRepositoryStub } =
          makeSut();
        jest
          .spyOn(
            loadCampaignStepsSummaryByClicksRepositoryStub,
            "loadCampaignSummaryByClick"
          )
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.load(1, 1, 1);
        await expect(promise).rejects.toThrow();
      });
    });

    test("Should return a FunnelModel[] on success", async () => {
      const { sut } = makeSut();
      const campaigns = await sut.load(1, 1, 1);
      expect(campaigns).toEqual(makeFakeCampaignSummary());
    });
  });

  describe("loadByDateRange", () => {
    const dateRange = { startDate: "2023-01-01", endDate: "2023-01-07" };

    describe("LoadCampaignRepository", () => {
      test("Should call LoadCampaignRepository with correct values", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignRepositoryStub,
          "loadCampaign"
        );
        await sut.loadByDateRange(1, 1, dateRange);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(1);
      });

      test("Should throw if LoadCampaignRepository throws", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadByDateRange(1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });

      test("Should return null if LoadCampaignRepository returns null", async () => {
        const { sut, loadCampaignRepositoryStub } = makeSut();
        jest
          .spyOn(loadCampaignRepositoryStub, "loadCampaign")
          .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
        const funnels = await sut.loadByDateRange(1, 1, dateRange);
        expect(funnels).toBeNull();
      });
    });

    describe("LoadCampaignStepsSummaryByClicksRepository", () => {
      test("Should call loadCampaignSummaryByClickByDateRange with correct values", async () => {
        const { sut, loadCampaignStepsSummaryByClicksRepositoryStub } =
          makeSut();
        const loadCampaignsSpy = jest.spyOn(
          loadCampaignStepsSummaryByClicksRepositoryStub,
          "loadCampaignSummaryByClickByDateRange"
        );
        await sut.loadByDateRange(1, 1, dateRange);
        expect(loadCampaignsSpy).toHaveBeenCalledWith(
          makeFakeCampaignSummary().id,
          dateRange
        );
      });

      test("Should throw if loadCampaignSummaryByClickByDateRange throws", async () => {
        const { sut, loadCampaignStepsSummaryByClicksRepositoryStub } =
          makeSut();
        jest
          .spyOn(
            loadCampaignStepsSummaryByClicksRepositoryStub,
            "loadCampaignSummaryByClickByDateRange"
          )
          .mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
          );
        const promise = sut.loadByDateRange(1, 1, dateRange);
        await expect(promise).rejects.toThrow();
      });
    });

    test("Should return a CampaignStepsSummary on success", async () => {
      const { sut } = makeSut();
      const campaigns = await sut.loadByDateRange(1, 1, dateRange);
      expect(campaigns).toEqual(makeFakeCampaignSummary());
    });
  });
});

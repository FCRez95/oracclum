/* eslint-disable no-undef */
import { LoadSiteStepsSummaryController } from './load-site-steps-summary-controller'
import { HttpRequest } from '../../protocols'
import { SiteStepsSummary } from '../../../domain/models/site-funnel'
import { LoadSiteStepsSummary } from '../../../domain/usecases/campaign/load-site-steps-summary'
import { badRequest, ok, serverError, unauthorized, taboolaTimeOut, taboolaTooMany } from '../../helpers/http-helper'

const makeFakeStepsData = (): SiteStepsSummary => ({
    id: 1,
    sales: 10,
    revenue: 5000,
    total_step_1: 100,
    step_1_views: 200,
    total_step_2: 80,
    step_2_views: 150,
    total_step_3: 60,
    step_3_views: 120,
    total_step_4: 50,
    step_4_views: 90,
    total_checkout: 30,
    checkout_views: 50
})

const makeLoadSiteStepsSummary = (): LoadSiteStepsSummary => {
    class LoadSiteStepsSummaryStub implements LoadSiteStepsSummary {
        async load(idUser: number, id_campaign: number, id_site: number, days: number) {
            return makeFakeStepsData()
        }

        async loadByDateRange(idUser: number, id_campaign: number, id_site: number, range: { startDate: string, endDate: string }) {
            return makeFakeStepsData()
        }
    }
    return new LoadSiteStepsSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
    params: {
        id_campaign: 1,
        id_site: 1,
        days: '7'
    },
    body: {
        idUser: 1
    }
})

const makeFakeRangeRequest = (): HttpRequest => ({
    params: {
        id_campaign: 1,
        id_site: 1,
        days: '2024-01-01|2024-01-07'
    },
    body: {
        idUser: 1
    }
})

interface SutTypes {
    sut: LoadSiteStepsSummaryController
    loadSiteStepsSummaryStub: LoadSiteStepsSummary
}

const makeSut = (): SutTypes => {
    const loadSiteStepsSummaryStub = makeLoadSiteStepsSummary()
    const sut = new LoadSiteStepsSummaryController(loadSiteStepsSummaryStub)
    return {
        sut,
        loadSiteStepsSummaryStub
    }
}

describe('LoadSiteStepsSummaryController', () => {
    test('Should call load with correct values when days is a number', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        const loadSpy = jest.spyOn(loadSiteStepsSummaryStub, 'load')
        await sut.handle(makeFakeRequest())
        expect(loadSpy).toHaveBeenCalledWith(1, 1, 1, 7)
    })

    test('Should call loadByDateRange with correct values when days is a date range', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        const loadSpy = jest.spyOn(loadSiteStepsSummaryStub, 'loadByDateRange')
        await sut.handle(makeFakeRangeRequest())
        expect(loadSpy).toHaveBeenCalledWith(1, 1, 1, { startDate: '2024-01-01', endDate: '2024-01-07' })
    })

    test('Should return 400 if date range format is invalid', async () => {
        const { sut } = makeSut()
        const invalidRequest = {
            ...makeFakeRequest(),
            params: { ...makeFakeRequest().params, days: '2024-01-01|invalid-date' }
        }
        const httpResponse = await sut.handle(invalidRequest)
        expect(httpResponse).toEqual(badRequest(new Error('Invalid date format. Expected YYYY-MM-DD|YYYY-MM-DD')))
    })

    test('Should return 400 if days param is not a valid number or range', async () => {
        const { sut } = makeSut()
        const invalidRequest = {
            ...makeFakeRequest(),
            params: { ...makeFakeRequest().params, days: 'not-a-number' }
        }
        const httpResponse = await sut.handle(invalidRequest)
        expect(httpResponse).toEqual(badRequest(new Error('Invalid days parameter. Expected number or date range.')))
    })

    test('Should return 401 if load returns null', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        jest.spyOn(loadSiteStepsSummaryStub, 'load').mockResolvedValueOnce(null)
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(unauthorized())
    })

    test('Should return 200 with data if load succeeds', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(ok(makeFakeStepsData()))
    })

    test('Should return 500 if load throws a generic error', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        jest.spyOn(loadSiteStepsSummaryStub, 'load').mockImplementationOnce(() => {
            throw new Error('Unexpected error')
        })
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(serverError(new Error('Unexpected error')))
    })

    test('Should return 429 if error message is "Taboola too many requests"', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        jest.spyOn(loadSiteStepsSummaryStub, 'load').mockImplementationOnce(() => {
            throw new Error('Taboola too many requests')
        })
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(taboolaTooMany(new Error('Taboola too many requests')))
    })

    test('Should return 504 if error message is "Taboola timeout"', async () => {
        const { sut, loadSiteStepsSummaryStub } = makeSut()
        jest.spyOn(loadSiteStepsSummaryStub, 'load').mockImplementationOnce(() => {
            throw new Error('Taboola timeout')
        })
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(taboolaTimeOut(new Error('Taboola timeout')))
    })
})

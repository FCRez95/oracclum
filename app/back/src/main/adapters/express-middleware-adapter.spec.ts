import { NextFunction, Request, Response } from 'express'
import { Middleware } from '../../presentation/protocols'
import { adptMiddleware } from './express-middleware-adapter'

type SutTypes = {
  middleware: Middleware
  handleSpy: jest.SpyInstance
  response: Response
  next: NextFunction
}

const makeSut = (): SutTypes => {
  const middleware = {
    handle: async () => ({
      statusCode: 200,
      body: { idUser: 1 }
    })
  }
  const handleSpy = jest.spyOn(middleware, 'handle')

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response

  return {
    middleware,
    handleSpy,
    response,
    next: jest.fn()
  }
}

const makeRequest = (body?: any): Request => ({
  headers: { 'x-access-token': 'any_token' },
  body
} as unknown as Request)

describe('Express Middleware Adapter', () => {
  test('Should create an empty body before merging middleware data', async () => {
    const { middleware, handleSpy, response, next } = makeSut()
    handleSpy.mockImplementationOnce(async httpRequest => {
      expect(httpRequest.body).toEqual({})
      return {
        statusCode: 200,
        body: { idUser: 1 }
      }
    })
    const request = makeRequest()

    await adptMiddleware(middleware)(request, response, next)

    expect(handleSpy).toHaveBeenCalledWith(expect.objectContaining({
      headers: request.headers
    }))
    expect(request.body).toEqual({ idUser: 1 })
    expect(next).toHaveBeenCalled()
  })

  test('Should preserve existing body data when merging middleware data', async () => {
    const { middleware, response, next } = makeSut()
    const request = makeRequest({ campaignId: 10 })

    await adptMiddleware(middleware)(request, response, next)

    expect(request.body).toEqual({
      campaignId: 10,
      idUser: 1
    })
    expect(next).toHaveBeenCalled()
  })

  test('Should return an error response when middleware rejects the request', async () => {
    const { middleware, response, next } = makeSut()
    jest.spyOn(middleware, 'handle').mockResolvedValueOnce({
      statusCode: 403,
      body: new Error('Access denied')
    })
    const request = makeRequest()

    await adptMiddleware(middleware)(request, response, next)

    expect(response.status).toHaveBeenCalledWith(403)
    expect(response.json).toHaveBeenCalledWith({ error: 'Access denied' })
    expect(next).not.toHaveBeenCalled()
  })
})

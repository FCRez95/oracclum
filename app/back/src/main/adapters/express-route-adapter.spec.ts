import { Request, Response } from 'express'
import { Controller } from '../../presentation/protocols'
import { adptRoute } from './express-route-adapter'

const makeController = (): Controller => ({
  handle: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: { ok: true }
  })
})

const makeRequest = (): Request => ({
  body: { any: 'body' },
  params: { id: '1' },
  headers: { 'x-access-token': 'any_token' },
  ip: '127.0.0.1'
} as unknown as Request)

const makeResponse = (): Response => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response)

describe('Express Route Adapter', () => {
  test('Should call controller with request data', async () => {
    const controller = makeController()
    const request = makeRequest()
    const response = makeResponse()

    await adptRoute(controller)(request, response)

    expect(controller.handle).toHaveBeenCalledWith({
      body: request.body,
      params: request.params,
      headers: request.headers,
      ip: request.ip
    })
  })

  test('Should return success response body', async () => {
    const controller = makeController()
    const response = makeResponse()

    await adptRoute(controller)(makeRequest(), response)

    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({ ok: true })
  })

  test('Should not expose error stack in API error response', async () => {
    const controller = makeController()
    const error = new Error('Internal server error')
    error.stack = 'secret_stack'
    jest.spyOn(controller, 'handle').mockResolvedValueOnce({
      statusCode: 500,
      body: error
    })
    const response = makeResponse()

    await adptRoute(controller)(makeRequest(), response)

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' })
  })
})

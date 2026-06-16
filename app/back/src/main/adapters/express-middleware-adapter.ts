import { HttpRequest, HttpResponse, Middleware } from '../../presentation/protocols'
import { NextFunction, Request, Response } from 'express'

export const adptMiddleware = (middleware: Middleware) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestBody = req.body ?? {}
    req.body = requestBody

    const httpRequest: HttpRequest = {
      headers: req.headers,
      body: requestBody
    }

    const httpResponse: HttpResponse = await middleware.handle(httpRequest)
    if (httpResponse.statusCode === 200) {
      Object.assign(requestBody, httpResponse.body)
      next()
    } else {
      res.status(httpResponse.statusCode).json({
        error: httpResponse.body.message
      })
    }
  }
}

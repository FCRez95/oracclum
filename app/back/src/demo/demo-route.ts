import { NextFunction, Request, Response } from 'express'
import { backendDemoData } from './demo-data'
import { isBackendDemoAccessToken, isBackendDemoLogin } from './demo-mode'

type DemoHandler = (req: Request) => unknown

export const backendDemoLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body ?? {}
  if (!isBackendDemoLogin(email, password)) {
    next()
    return
  }

  res.status(200).json({ accessToken: backendDemoData.accessToken })
}

export const backendDemoByToken = (handler: DemoHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!isBackendDemoAccessToken(req.headers['x-access-token'] as string | string[])) {
      next()
      return
    }

    res.status(200).json(handler(req))
  }
}

export const backendDemoResponse = (handler: DemoHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body?.isBackendDemo) {
      next()
      return
    }

    res.status(200).json(handler(req))
  }
}

import { LoadClickById } from '../../../domain/usecases/clicks/load-click-by-id'
import { NotFoundError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoadClickByIdController implements Controller {
  private readonly loadClickById: LoadClickById

  constructor (loadClickById: LoadClickById) {
    this.loadClickById = loadClickById
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_click } = httpRequest.params
      if (!id_click) {
        return badRequest(new Error('Missing param: id_click'))
      }

      const click = await this.loadClickById.load(id_click)
      if (!click) {
        return badRequest(new NotFoundError('Click'))
      }

      return ok(click)
    } catch (error) {
      return serverError(error)
    }
  }
}

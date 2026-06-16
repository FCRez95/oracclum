import { InvalidParamError } from '../../errors'
import { Validation } from '../../protocols'

export class CompareFieldsValidation implements Validation {
  private readonly fieldName: string
  private readonly fieldConfirmationName: string

  constructor (fieldName: string, fieldConfirmationName: string) {
    this.fieldName = fieldName
    this.fieldConfirmationName = fieldConfirmationName
  }

  validate (input: any): Error {
    if (input[this.fieldName] !== input[this.fieldConfirmationName]) {
      return new InvalidParamError(this.fieldConfirmationName)
    }
  }
}

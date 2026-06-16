/* eslint-disable no-undef */
import { InvalidParamError } from '../../errors'
import { CompareFieldsValidation } from './compare-fields-validation'

const makeSut = (): CompareFieldsValidation => {
  return new CompareFieldsValidation('field', 'fieldConfirmation')
}

describe('RequiredField Validations', () => {
  test('Should return InvalidParamError if validation fails', () => {
    const sut = makeSut()
    const error = sut.validate({
      field: 'any_value',
      fieldConfirmation: 'wrong_value'
    })
    expect(error).toEqual(new InvalidParamError('fieldConfirmation'))
  })

  test('Should return not return if validation succeeds', () => {
    const sut = makeSut()
    const error = sut.validate({
      field: 'any_value',
      fieldConfirmation: 'any_value'
    })
    expect(error).toBeFalsy()
  })
})

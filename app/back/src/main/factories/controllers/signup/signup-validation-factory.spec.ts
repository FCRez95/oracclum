/* eslint-disable no-undef */
import { CompareFieldsValidation } from '../../../../presentation/helpers/validators/compare-fields-validation'
import { EmailValidation } from '../../../../presentation/helpers/validators/email-validation'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { Validation } from '../../../../presentation/protocols'
import { EmailValidator } from '../../../../presentation/protocols/email-validator'
import { makeSignUpValidation } from './signup-validation-factory'

jest.mock('../../../../presentation/helpers/validators/validator-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email:string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

describe('SignUpValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeSignUpValidation()
    const validations: Validation[] = []
    const fields = ['name', 'email', 'password', 'passwordConfirmation']
    for (const field of fields) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
    validations.push(new EmailValidation(makeEmailValidator(), 'email'))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})

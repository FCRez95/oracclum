import { CompareFieldsValidation } from '../../../../presentation/helpers/validators/compare-fields-validation'
import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { Validation } from '../../../../presentation/protocols'
import { EmailValidation } from '../../../../presentation/helpers/validators/email-validation'
import { EmailValidatorAdapter } from '../../../../utils/email-validator-adapter'

export const makeSignUpValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields = ['phone', 'email', 'password', 'passwordConfirmation']
  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }
  validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
  validations.push(new EmailValidation(new EmailValidatorAdapter(), 'email'))
  return new ValidationComposite(validations)
}

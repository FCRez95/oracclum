import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { Validation } from '../../../../presentation/protocols'

export const makeAddTaboolaInfoValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields = ['accountId', 'clientId', 'clientSecret']
  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}

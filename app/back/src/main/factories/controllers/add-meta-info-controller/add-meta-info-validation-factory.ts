import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { Validation } from '../../../../presentation/protocols'

export const makeAddMetaInfoValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  validations.push(new RequiredFieldValidation('metaAccessToken'))
  validations.push(new RequiredFieldValidation('allowedAccounts'))
  return new ValidationComposite(validations)
}

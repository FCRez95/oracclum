import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { Validation } from '../../../../presentation/protocols'

export const makeDisconnectMetaValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  validations.push(new RequiredFieldValidation('idUser'))
  return new ValidationComposite(validations)
}

import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { Validation } from '../../../../presentation/protocols'

export const makeAddCampaignValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields = ['name', 'link', 'ad_provider', 'external_id']
  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}

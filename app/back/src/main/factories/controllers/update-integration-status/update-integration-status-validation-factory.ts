import { ValidationComposite } from "../../../../presentation/helpers/validators/validator-composite"
import { RequiredFieldValidation } from "../../../../presentation/helpers/validators/required-field-validation"
import { Validation } from "../../../../presentation/protocols"

export const makeUpdateIntegrationStatusValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields = ['idCampaign', 'step', 'status']

  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }

  return new ValidationComposite(validations)
}

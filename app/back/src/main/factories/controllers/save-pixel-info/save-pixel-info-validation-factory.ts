import { ValidationComposite } from "../../../../presentation/helpers/validators/validator-composite"
import { RequiredFieldValidation } from "../../../../presentation/helpers/validators/required-field-validation"
import { Validation } from "../../../../presentation/protocols"

export const makeSavePixelInfoValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields = ['id_campaign', 'access_token', 'pixel_id']

  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }

  return new ValidationComposite(validations)
}

/* eslint-disable no-undef */
import { CompareFieldsValidation } from '../../../../presentation/helpers/validators/compare-fields-validation'
import { EmailValidation } from '../../../../presentation/helpers/validators/email-validation'
import { RequiredFieldValidation } from '../../../../presentation/helpers/validators/required-field-validation'
import { ValidationComposite } from '../../../../presentation/helpers/validators/validator-composite'
import { Validation } from '../../../../presentation/protocols'
import { makeAddTaboolaInfoValidation } from './add-taboola-info-validation-factory'

jest.mock('../../../../presentation/helpers/validators/validator-composite')

describe('AddCampaignValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeAddTaboolaInfoValidation()
    const validations: Validation[] = []
    const fields = ['accountId', 'clientId', 'clientSecret']
    for (const field of fields) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})

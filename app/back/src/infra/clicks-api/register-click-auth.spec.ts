import { RegisterClickAuthApi } from './register-click-auth'

const mockedFetch = jest.fn()

describe('RegisterClickAuthApi', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    global.fetch = mockedFetch
  })

  test('Should call meta clicks api for meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RegisterClickAuthApi()

    await sut.register('token_1', 10, 'meta')

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://clicks-meta.oracclum.com/admin/clickauth',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  test('Should call default clicks api for non-meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RegisterClickAuthApi()

    await sut.register('token_1', 10, 'taboola')

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://clicks-api.oracclum.com/admin/clickauth',
      expect.objectContaining({ method: 'PUT' })
    )
  })
})

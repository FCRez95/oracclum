import { RemoveClickAuthApi } from './remove-click-auth'

const mockedFetch = jest.fn()

describe('RemoveClickAuthApi', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    global.fetch = mockedFetch
  })

  test('Should call meta clicks api for meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RemoveClickAuthApi()

    await sut.remove('token_1', 10, 'meta')

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://clicks-meta.oracclum.com/admin/clickauth/token_1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  test('Should call default clicks api for non-meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RemoveClickAuthApi()

    await sut.remove('token_1', 10, 'taboola')

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://clicks-api.oracclum.com/admin/clickauth/token_1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

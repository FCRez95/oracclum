import { RemoveClickAuthApi } from './remove-click-auth'

const mockedFetch = jest.fn()
const clickAuthConfig = {
  defaultBaseUrl: 'http://localhost:8080/admin/clickauth/',
  metaBaseUrl: 'http://localhost:8081/admin/clickauth/',
  adminToken: 'local-admin-token'
}

describe('RemoveClickAuthApi', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    global.fetch = mockedFetch
  })

  test('Should call meta clicks api for meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RemoveClickAuthApi(clickAuthConfig)

    await sut.remove('token_1', 10, 'meta')

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://localhost:8081/admin/clickauth/token_1',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer local-admin-token'
        }
      })
    )
  })

  test('Should call default clicks api for non-meta campaigns', async () => {
    mockedFetch.mockResolvedValue({ ok: true })
    const sut = new RemoveClickAuthApi(clickAuthConfig)

    await sut.remove('token_1', 10, 'taboola')

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://localhost:8080/admin/clickauth/token_1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

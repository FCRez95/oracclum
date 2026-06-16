export interface UpdateAccessTokenRepository {
    updateAccessToken (id: number, accessToken: string): Promise<void>
}

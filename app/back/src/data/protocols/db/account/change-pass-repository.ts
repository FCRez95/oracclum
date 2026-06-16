export interface ChangePassRepository {
    changePassword (id_user: number, hashedPassword: string): Promise<void>
}
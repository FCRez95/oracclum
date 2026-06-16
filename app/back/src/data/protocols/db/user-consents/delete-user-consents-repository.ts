export interface DeleteUserConsentsRepository {
  deleteByUser (idUser: number): Promise<void>
}

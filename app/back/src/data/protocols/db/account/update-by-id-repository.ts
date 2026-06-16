export interface UpdateByIdRepository {
    updateById (id: number, columnToUpdate: string, value: string): Promise<void>
}

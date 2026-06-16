import { Pool } from 'mysql2'

export const insertOne = (pool: Pool, table: string, value: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`INSERT INTO ${table} SET ?`, value, (error, result) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(result)
      })
    })
  })
}

export const getCount = (pool: Pool, table: string, filter?: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT count(id) FROM ${table} ${filter ? filter : ''}`, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows[0]['count(id)'])
      })
    })
  })
}

export const getOne = (pool: Pool, table: string, columnToCompare: string, valueToCompare: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT * FROM ${table} WHERE ${columnToCompare} = ? LIMIT 1`, valueToCompare, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

export const getAll = (pool: Pool, table: string, filter?: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT * FROM ${table} ${filter ? filter : ''}`, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

export const getAllUnique = (pool: Pool, table: string, distinctColumn: string, filter?: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT DISTINCT ${distinctColumn} FROM ${table} ${filter ? filter : ''}`, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })

    })
  })
}

export const updateById = (pool: Pool, table: string, columnToInsert: string, valueToCompare: any, valueToInsert: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`UPDATE ${table} SET ${columnToInsert} = ? WHERE id = ?`, [valueToInsert, valueToCompare], (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

export const getSum = (pool: Pool, table: string, columnToSum: string, filter?: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT sum(${columnToSum}) as total FROM ${table} ${filter ? filter : ''}`, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

export const deleteById = (pool: Pool, table: string, columnToCompare: string, value: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`DELETE FROM ${table} WHERE ${columnToCompare} = ?`, [value], (error, result) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(result)
      })
    })
  })
}

export const runQuery = (pool: Pool, query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(query, params, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

export const getOneSortedDesc = (pool: Pool, table: string, columnToCompare: string, valueToCompare: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err
      connection.query(`SELECT * FROM ${table} WHERE ${columnToCompare} = ? ORDER BY id DESC LIMIT 2`, valueToCompare, (error, rows) => {
        if (error) {
          connection.release()
          return reject(error)
        }
        connection.release()
        resolve(rows as any[])
      })
    })
  })
}

import { Pool } from "mysql2"
import { LogMysqlRepository } from "../../../../infra/db/mysql/log/log-mysql-repository"
import { SavePixelInfoController } from "../../../../presentation/controller/save-pixel-info/save-pixel-info-controller"
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator"
import { makeDbSavePixelInfo } from "../../usecases/save-pixel-info/db-save-pixel-info-factory"
import { makeSavePixelInfoValidation } from "./save-pixel-info-validation-factory"

export const makeSavePixelInfoController = (pool: Pool) => {
  const savePixelInfoController = new SavePixelInfoController(makeDbSavePixelInfo(pool), makeSavePixelInfoValidation())
  const logMysqlRepository = new LogMysqlRepository(pool)

  return new LogControllerDecorator(savePixelInfoController, logMysqlRepository)
}

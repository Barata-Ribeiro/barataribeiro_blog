import { NextFunction, Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"

const DATA_REPO_ID = process.env.DATA_REPO_ID
const DATA_CATEGORY_ID = process.env.DATA_CATEGORY_ID

const SetLocalsVariables = (_req: Request, res: Response, next: NextFunction) => {
    res.locals.nonce = uuidv4()
    res.locals.dataRepoId = DATA_REPO_ID
    res.locals.dataCategoryId = DATA_CATEGORY_ID

    next()
}

export default SetLocalsVariables

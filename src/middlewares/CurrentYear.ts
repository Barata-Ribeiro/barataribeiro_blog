import { NextFunction, Request, Response } from "express"

const SetCurrentYear = (_req: Request, res: Response, next: NextFunction) => {
    res.locals.currentYear = new Date().getFullYear()
    next()
}

export default SetCurrentYear

import { NextFunction, Request, Response } from "express"

const noCache = (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")

    next()
}

export default noCache

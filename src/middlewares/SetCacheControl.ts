import { NextFunction, Request, Response } from "express"

const SetCacheControl = (req: Request, res: Response, next: NextFunction) => {
    const cachedPeriod = 60 // 1 minute

    if (req.method === "GET") res.setHeader("Cache-Control", `public, max-age=${cachedPeriod}`)
    else res.setHeader("Cache-Control", "no-store")

    next()
}

export default SetCacheControl

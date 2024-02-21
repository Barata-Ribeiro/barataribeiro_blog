import { NextFunction, Request, Response } from "express"

const SetCacheControl = (req: Request, res: Response, next: NextFunction) => {
    const cachedPeriod = 60 * 5 // 5 minutes

    if (req.method === "GET") res.setHeader("Cache-Control", `public, max-age=${cachedPeriod}`)
    else res.setHeader("Cache-Control", "no-store")

    next()
}

export default SetCacheControl

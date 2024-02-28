import { NextFunction, Request, Response } from "express"
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken"
import User from "../api/v1/models/User"
import { NotFoundError, UnauthorizedError } from "./helpers/ApiErrors"

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authTokenCookie = req.cookies.authToken
        if (!authTokenCookie) return next(new UnauthorizedError("You must be logged in to proceed."))

        const tokenfromCookie = authTokenCookie
        if (!tokenfromCookie) return next(new UnauthorizedError("Your cookie is missing the authorization token."))

        const secretKey = process.env.JWT_SECRET_KEY
        if (!secretKey)
            return next(
                new NotFoundError(
                    "The server is missing its JWT secret key. You should report this issue to the administrator."
                )
            )

        const payload = verify(tokenfromCookie, secretKey)
        const { username } = payload as { username: string }
        if (!username) return next(new NotFoundError("The token is missing the username."))

        const userFromDatabase = await User.findOne({ username })
        if (!userFromDatabase) return next(new NotFoundError("The user does not exist."))

        req.session.user = {
            data: userFromDatabase,
            isLoggedIn: true
        }

        req.session.save((err) => {
            if (err) {
                console.error(err)
                next(new UnauthorizedError("Failed to save the session."))
            }

            res.locals.user = userFromDatabase

            next()
        })
    } catch (error) {
        if (error instanceof TokenExpiredError) next(new UnauthorizedError("Your token has expired."))
        else if (error instanceof JsonWebTokenError) next(new UnauthorizedError("Invalid token."))
        else next(error)
    }
}

export default authMiddleware

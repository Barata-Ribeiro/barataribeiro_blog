import { NextFunction, Request, Response } from "express"
import { ApiError } from "./helpers/ApiErrors"

/**
 * Express middleware for handling errors.
 * If the error has a status code, it returns the status code and the error message.
 * Otherwise, it returns a 500 status code and the message "Internal Server Error".
 *
 * @param error - The error object.
 * @param _req - The Express request object.
 * @param res - The Express response object.
 * @param _next - The Express next function.
 * @returns void, but it sends a response to the client rendering the error page.
 */
const errorMiddleware = (error: Error & Partial<ApiError>, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error.status ?? 500
    const message = error.status ? error.message : "Internal Server Error"

    const data = {
        title: `${statusCode} - Error`,
        description: message,
        statusCode,
        message
    }

    return res.status(statusCode).render("pages/errors/error", data)
}

export default errorMiddleware

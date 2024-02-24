/**
 * Represents an API error with a specific status code.
 */
export class ApiError extends Error {
    public readonly status: number

    /**
     * Creates a new instance of the ApiError class.
     * @param message The error message.
     * @param status The HTTP status code.
     */
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

/**
 * Represents a BadRequestError, which is an error that occurs when the client sends
 * a malformed request to the server.
 * Extends the base class ApiError.
 */
export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400)
    }
}

/**
 * Represents an Unauthorized Error, which is an error that occurs when the client
 * is not authorized to perform the requested action.
 * Extends the base class ApiError.
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(message, 401)
    }
}

/**
 * Represents a Forbidden Error, which is an error that occurs when the client is not allowed
 * to perform the requested action.
 * Extends the base class ApiError.
 */
export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(message, 403)
    }
}

/**
 * Represents a NotFoundError, which is an error that occurs when a resource is not found.
 * Extends the base class ApiError.
 */
export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404)
    }
}

/**
 * Represents a MethodNotAllowedError, which is thrown when a request method is not allowed.
 * Extends the base class ApiError.
 */
export class MethodNotAllowedError extends ApiError {
    constructor(message: string) {
        super(message, 405)
    }
}

/**
 * Represents a Conflict Error, which is thrown when there is a conflict with the current state of the resource.
 * For example, if you try to create a resource that already exists, you will get a conflict error.
 * This error is thrown when there is a conflict with the current state of the resource.
 */
export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409)
    }
}

/**
 * Represents an error that occurs when the media type of a request is not supported.
 * Extends the base class ApiError.
 */
export class UnsupportedMediaTypeError extends ApiError {
    constructor(message: string) {
        super(message, 415)
    }
}

/**
 * Represents an error that occurs when the server understands the content type of the request entity,
 * and the syntax of the request entity is correct, but it was unable to process the contained instructions.
 */
export class UnprocessableContentError extends ApiError {
    constructor(message: string) {
        super(message, 422)
    }
}

/**
 * Represents an internal server error, which is an error that occurs when the server
 * encounters an unexpected condition that prevents it from fulfilling the request.
 * Inherits from the base ApiError class.
 */
export class InternalServerError extends ApiError {
    constructor(message: string) {
        super(message, 500)
    }
}

/**
 * Represents a custom error class for the "Not Implemented" HTTP status code (501).
 * Extends the base class ApiError.
 */
export class NotImplemented extends ApiError {
    constructor(message: string) {
        super(message, 501)
    }
}

/**
 * Represents a Bad Gateway error, which is an error that occurs when the server
 * receives an invalid response from an upstream server.
 * Extends the base ApiError class.
 */
export default class BadGatewayError extends ApiError {
    constructor(message: string) {
        super(message, 502)
    }
}

/**
 * Represents a Service Unavailable Error. This error occurs when a service is temporarily unavailable.
 * This error occurs when a service is temporarily unavailable.
 */
export class ServiceUnavailableError extends ApiError {
    constructor(message: string) {
        super(message, 503)
    }
}

/**
 * Represents a Gateway Timeout Error, which is an error that occurs when the server
 * receives a timeout from an upstream server.
 * Extends the base ApiError class.
 */
export class GatewayTimeoutError extends ApiError {
    constructor(message: string) {
        super(message, 504)
    }
}

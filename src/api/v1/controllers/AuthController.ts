import bcrypt from "bcrypt"
import { Request, Response } from "express"
import { sign } from "jsonwebtoken"
import mongoose from "mongoose"
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError
} from "../../../middlewares/helpers/ApiErrors"
import User from "../models/User"

export class AuthController {
    async login(req: Request, res: Response) {
        const sessionData = req.session.user
        if (sessionData?.isLoggedIn) return res.status(302).redirect(`/dashboard/${sessionData.data.username}`)

        const { username, password } = req.body
        if (!username || !password) throw new BadRequestError("Username and password are required.")

        const user = await User.findOne({ username })
        if (!user || !user.comparePassword(password)) throw new UnauthorizedError("Invalid username or password.")

        const secretKey = process.env.JWT_SECRET_KEY || "secret"
        if (!secretKey) throw new NotFoundError("JWT secret key not found. Please contact the administrator.")

        const jwtToken = sign({ username: user.username }, secretKey, { expiresIn: "1d" })

        res.cookie("authToken", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000
        })

        req.session.save((err) => {
            if (err) {
                console.error(err)
                throw new UnauthorizedError("Failed to save the session.")
            }

            res.locals.user = user

            return res.status(200).json({ status: "success", message: "Logged in successfully" })
        })
    }

    async register(req: Request, res: Response) {
        const { username, email, password } = req.body
        if (!username || !email || !password) throw new BadRequestError("Username, email and password are required.")

        const doesUserExistByUsername = await User.exists({ username })
        if (doesUserExistByUsername) throw new ConflictError("An account with this username already exists.")

        const doesUserExistByEmail = await User.exists({ email })
        if (doesUserExistByEmail) throw new ConflictError("An account with this email already exists.")

        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(password, salt)

        try {
            const newUser = await User.create({ username, email, password: hashPassword })
            return res
                .status(201)
                .json({ status: "success", message: "User account created successfully.", data: newUser })
        } catch (error) {
            console.error(error)
            if (error instanceof mongoose.Error.ValidationError) {
                const messages = Object.values(error.errors).map(
                    (err) => `${err.name}: ${this.capitalizeFirstLetter(err.path)} ${err.message}.`
                )
                throw new BadRequestError(messages.join(", "))
            }
            throw new InternalServerError("Failed to create user account.")
        }
    }

    async logout(_req: Request, _res: Response) {}

    private capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
}

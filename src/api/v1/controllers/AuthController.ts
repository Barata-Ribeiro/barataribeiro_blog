// import bcrypt from "bcrypt"
import { NextFunction, Request, Response } from "express"
import { sign } from "jsonwebtoken"
// import mongoose from "mongoose"
import { InternalServerError } from "../../../middlewares/helpers/ApiErrors"
import User from "../models/User"

export class AuthController {
    async login(req: Request, res: Response) {
        const sessionData = req.session.user
        if (sessionData?.isLoggedIn) return res.sendStatus(302).redirect(`/dashboard/${sessionData?.data?.username}`)

        const head = {
            title: "Login",
            description: "Login to your account."
        }

        const { username, password } = req.body
        if (!username || !password)
            return res.render("pages/auth/login", {
                ...head,
                error: "Username and password are required."
            })

        const user = await User.findOne({ username }).select("+password")
        const checkPassword = user?.comparePassword(password)
        if (!user || !checkPassword)
            return res.render("pages/auth/login", { ...head, error: "Invalid username or password." })

        const secretKey = process.env.JWT_SECRET_KEY || "secret"
        if (!secretKey)
            return res.render("pages/auth/login", {
                ...head,
                error: "JWT secret key not found. \n Please contact the administrator."
            })

        const jwtToken = sign({ username: user.username }, secretKey, { expiresIn: "1d" })

        res.cookie("authToken", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        req.session.user = {
            data: user,
            isLoggedIn: true
        }

        req.session.save((err) => {
            if (err) {
                console.error(err)
                return res.render("pages/auth/login", { ...head, error: "Failed to save session." })
            }

            res.locals.user = user

            return res.sendStatus(302).redirect(`/dashboard/${user.username}`)
        })
    }

    async register(req: Request, res: Response) {
        const sessionData = req.session.user
        if (sessionData?.isLoggedIn) return res.sendStatus(302).redirect(`/dashboard/${sessionData?.data?.username}`)

        const head = {
            title: "Register",
            description: "Register a new account."
        }

        return res.render("pages/auth/register", { ...head, error: "User registration is currently not allowed." })

        // const { username, email, password } = req.body
        // if (!username || !email || !password)
        //     return res.render("pages/auth/register", { ...head, error: "Username, email and password are required."
        // })

        // const doesUserExistByUsername = await User.exists({ username })
        // if (doesUserExistByUsername)
        //     return res.render("pages/auth/register", {
        //         ...head,
        //         error: "An account with this username already exists."
        //     })

        // const doesUserExistByEmail = await User.exists({ email })
        // if (doesUserExistByEmail)
        //     return res.render("pages/auth/register", { ...head, error: "An account with this email already exists."
        // })

        // const salt = bcrypt.genSaltSync(10)
        // const hashPassword = bcrypt.hashSync(password, salt)

        // try {
        //     await User.create({ username, email, password: hashPassword })
        //     return res.sendStatus(201).redirect("/auth/login")
        // } catch (error) {
        //     console.error(error)
        //     if (error instanceof mongoose.Error.ValidationError) {
        //         const messages = Object.values(error.errors).map(
        //             (err) => `${err.name}: ${this.capitalizeFirstLetter(err.path)} ${err.message}.`
        //         )
        //         return res.render("pages/auth/register", { ...head, error: messages.join(" ") })
        //     }
        //     return res.render("pages/auth/register", { ...head, error: "Failed to create user account." })
        // }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        res.clearCookie("authToken")

        req.session.user = {
            data: null,
            isLoggedIn: false
        }

        req.session.destroy((err) => {
            if (err) {
                console.error(err)
                return next(new InternalServerError("Failed to destroy session."))
            }

            res.locals.user = null
            res.clearCookie("connect.sid")

            return res.sendStatus(302).redirect("/auth/login")
        })
    }

    // private capitalizeFirstLetter(str: string) {
    //     return str.charAt(0).toUpperCase() + str.slice(1)
    // }
}

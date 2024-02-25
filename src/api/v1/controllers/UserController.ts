import { Request, Response } from "express"
import { UserEditRequestBody } from "../../../interfaces/UserInterfaces"
import { InternalServerError, NotFoundError } from "../../../middlewares/helpers/ApiErrors"
import User from "../models/User"
import { UserService } from "../services/UserService"

export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    public async getAllUsers(_req: Request, res: Response) {
        try {
            const users = await User.find().sort("createdAt")

            return res.status(200).json({
                status: "success",
                message: "Users retrieved successfully",
                data: users
            })
        } catch (error) {
            console.error(error)
            throw new InternalServerError("Failed to retrieve users.")
        }
    }

    public async getUser(req: Request, res: Response) {
        try {
            const user = await User.findOne({ username: req.params.username })
            if (!user) throw new NotFoundError("User not found.")

            return res.status(200).json({
                status: "success",
                message: "User retrieved successfully",
                data: user
            })
        } catch (error) {
            console.error(error)
            throw new InternalServerError("Failed to retrieve user.")
        }
    }

    public async updateUser(req: Request, res: Response) {
        const { username } = req.params
        if (!username) throw new NotFoundError("Requesting parameter 'username' is missing.")

        const requestingBody = req.body as UserEditRequestBody
        if (!requestingBody) throw new NotFoundError("You must provide at least one field to update your profile.")

        const response = await this.userService.updateUser(username, requestingBody)

        return res.status(200).json({
            status: "success",
            message: "Your profile has been updated successfully.",
            data: response
        })
    }

    public async deleteUser(req: Request, res: Response) {
        const { username } = req.params
        if (!username) throw new NotFoundError("Requesting parameter 'username' is missing.")

        try {
            await User.findOneAndDelete({ username })

            return res.status(200).json({
                status: "success",
                message: "Your account has been deleted successfully."
            })
        } catch (error) {
            console.error(error)
            throw new InternalServerError("Failed to delete your account.")
        }
    }
}

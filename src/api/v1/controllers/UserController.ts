import { Request, Response } from "express"
import { InternalServerError } from "../../../middlewares/helpers/ApiErrors"
import User from "../models/User"

export class UserController {
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
            // ...
        } catch (error) {}
    }

    public async updateUser(req: Request, res: Response) {
        // ...
    }

    public async deleteUser(req: Request, res: Response) {
        // ...
    }
}

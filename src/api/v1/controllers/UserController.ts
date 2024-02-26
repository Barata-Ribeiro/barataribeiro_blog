import { Request, Response } from "express"
import { UserService } from "../services/UserService"
export class UserController {
    private userServie: UserService

    constructor() {
        this.userService = new UserService()
    }

    async updateAccount(req: Request, res: Response) {
        // ...
    }

    async deleteAccount(req: Request, res: Response) {
        // ...
    }
}

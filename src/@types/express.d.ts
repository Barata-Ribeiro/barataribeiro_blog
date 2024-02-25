import { User } from "../api/v1/models/User"

declare module "express-session" {
    export interface SessionData {
        user: {
            data: User
            isLoggedIn: boolean
        }
    }
}

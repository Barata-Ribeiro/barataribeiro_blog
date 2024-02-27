import { Router } from "express"
import User from "../api/v1/models/User"
import authMiddleware from "../middlewares/AuthMiddleware"
import { ForbiddenError, InternalServerError, NotFoundError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })

routes.get("/:username", authMiddleware, async (req, res) => {
    const { username } = req.params
    if (!username) throw new ForbiddenError("Username is missing. Try to log into your account again.")

    try {
        const user = await User.findOne({ username })
        if (!user) throw new NotFoundError("User not found. Try to log into your account again.")

        const userHead = {
            title: `Dashboard - ${user.username}`,
            description: `Welcome back, ${user.username}!`
        }

        return res.render("pages/users/dashboard", { ...userHead, user })
    } catch (error) {
        console.error(error)
        throw new InternalServerError("An error occurred while trying to log into your account.")
    }
})

export default routes

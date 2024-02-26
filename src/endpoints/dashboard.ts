import { Router } from "express"
import User from "../api/v1/models/User"
import authMiddleware from "../middlewares/AuthMiddleware"

const routes = Router({ mergeParams: true })

routes.get("/dashboard/:username", authMiddleware, async (req, res) => {
    const sessionData = req.session.user
    if (sessionData?.isLoggedIn) return res.status(302).redirect(`/dashboard/${sessionData?.data?.username}`)

    const loginHead = {
        title: "Login",
        description: "Login to your account."
    }

    const { username } = req.params
    if (!username)
        return res.render("pages/auth/login", {
            ...loginHead,
            error: "400 - Username is missing.Try to log into your account again."
        })

    try {
        const user = await User.findOne({ username })
        if (!user)
            return res.render("pages/auth/login", {
                ...loginHead,
                error: "404 - User not found. Try to log into your account again."
            })

        const userHead = {
            title: `Dashboard - ${user.username}`,
            description: `Welcome back, ${user.username}!`
        }

        return res.render("pages/users/dashboard", { ...userHead, user })
    } catch (error) {
        console.error(error)
        return res.render("pages/auth/login", { ...loginHead, error: "500 - Internal server error." })
    }
})

export default routes

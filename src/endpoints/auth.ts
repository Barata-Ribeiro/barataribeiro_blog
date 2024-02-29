import { Router } from "express"

const routes = Router({ mergeParams: true })

routes.get("/register", (req, res) => {
    const sessionData = req.session.user
    if (sessionData?.isLoggedIn) return res.status(302).redirect(`/dashboard/${sessionData?.data?.username}`)

    res.status(200).render("pages/auth/register", {
        title: "Register",
        description: "Register a new account.",
        error: null
    })
})

routes.get("/login", (req, res) => {
    const sessionData = req.session.user
    if (sessionData?.isLoggedIn) return res.status(302).redirect(`/dashboard/${sessionData?.data?.username}`)

    res.status(200).render("pages/auth/login", {
        title: "Login",
        description: "Login to your account.",
        error: null
    })
})

export default routes

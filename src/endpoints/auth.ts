import { Router } from "express"

const routes = Router({ mergeParams: true })

routes.get("/register", (req, res) => {
    const sessionData = req.session.user
    if (sessionData?.isLoggedIn) return res.sendStatus(302).redirect(`/dashboard/${sessionData?.data?.username}`)

    res.sendStatus(200).render("pages/auth/register", {
        title: "Register | Book of Shadows",
        description: "Register a new account.",
        error: null
    })
})

routes.get("/login", (req, res) => {
    const sessionData = req.session.user
    if (sessionData?.isLoggedIn) return res.sendStatus(302).redirect(`/dashboard/${sessionData?.data?.username}`)

    res.sendStatus(200).render("pages/auth/login", {
        title: "Login | Book of Shadows",
        description: "Login to your account.",
        error: null
    })
})

export default routes

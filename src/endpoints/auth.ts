import { Router } from "express"

const routes = Router({ mergeParams: true })

routes.get("/register", (_req, res) =>
    res.status(200).render("pages/auth/register", {
        title: "Register",
        description: "Register a new account.",
        error: null
    })
)

routes.get("/login", (_req, res) =>
    res.status(200).render("pages/auth/login", {
        title: "Login",
        description: "Login to your account.",
        error: null
    })
)

export default routes

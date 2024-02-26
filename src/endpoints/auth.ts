import { Router } from "express"

const routes = Router({ mergeParams: true })

routes.get("/register", (req, res) =>
    res.status(200).render("pages/auth/register", {
        title: "Register",
        description: "Register a new account",
        errorMessage: req.query.error
    })
)

routes.get("/login", (req, res) =>
    res.status(200).render("pages/auth/login", {
        title: "Login",
        description: "Login to your account",
        errorMessage: req.query.error
    })
)

export default routes

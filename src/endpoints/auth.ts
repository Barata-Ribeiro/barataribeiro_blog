import { Router } from "express"

const routes = Router({ mergeParams: true })

routes.get("/register", (_req, res) =>
    res.status(200).render("pages/register", { title: "Register", description: "Register a new account" })
)

routes.get("/login", (_req, res) =>
    res.status(200).render("pages/login", { title: "Login", description: "Login to your account" })
)

export default routes

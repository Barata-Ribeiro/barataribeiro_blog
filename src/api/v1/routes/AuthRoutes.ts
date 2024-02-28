import { Router } from "express"
import authMiddleware from "../../../middlewares/AuthMiddleware"
import { AuthController } from "../controllers/AuthController"

const routes = Router()
const authController = new AuthController()

routes.post("/login", (req, res, next) => authController.login(req, res).catch(next))

routes.post("/register", (req, res, next) => authController.register(req, res).catch(next))

routes.get("/logout", authMiddleware, (req, res, next) => authController.logout(req, res, next).catch(next))

export default routes

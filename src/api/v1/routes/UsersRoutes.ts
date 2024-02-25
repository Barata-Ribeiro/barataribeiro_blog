import { Router } from "express"
import authMiddleware from "../../../middlewares/AuthMiddleware"
import { UserController } from "../controllers/UserController"

const routes = Router()
const userController = new UserController()

routes.get("/", (req, res, next) => userController.getAllUsers(req, res).catch(next))

routes.get("/:username", (req, res, next) => userController.getUser(req, res).catch(next))

routes.put("/:username", authMiddleware, (req, res, next) => userController.updateUser(req, res).catch(next))

routes.delete("/:username", authMiddleware, (req, res, next) => userController.deleteUser(req, res).catch(next))

export default routes

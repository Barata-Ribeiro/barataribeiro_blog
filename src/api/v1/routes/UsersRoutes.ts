import { Router } from "express"
import authMiddleware from "../../../middlewares/AuthMiddleware"
import { UserController } from "../controllers/UserController"

const routes = Router()
const userController = new UserController()

routes.post("/:username/edit-account", authMiddleware, (req, res, next) =>
    userController.updateAccount(req, res).catch(next)
)

routes.post("/:username/posts/new-post", authMiddleware, (req, res, next) =>
    userController.createPost(req, res).catch(next)
)

routes.post("/:username/posts/:postId/edit-post", authMiddleware, (req, res, next) =>
    userController.editPost(req, res).catch(next)
)

routes.delete("/:username", authMiddleware, (req, res, next) => userController.deleteAccount(req, res, next).catch(next))

export default routes

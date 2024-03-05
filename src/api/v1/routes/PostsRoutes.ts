import { Router } from "express"
import authMiddleware from "../../../middlewares/AuthMiddleware"
import { PostController } from "../controllers/PostController"

const routes = Router()
const postController = new PostController()

routes.post("/:postId/delete", authMiddleware, (req, res, next) =>
    postController.deletePost(req, res, next).catch(next)
)

export default routes

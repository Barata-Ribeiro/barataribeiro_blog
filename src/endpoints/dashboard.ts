import { NextFunction, Request, Response, Router } from "express"
import Post from "../api/v1/models/Post"
import User from "../api/v1/models/User"
import authMiddleware from "../middlewares/AuthMiddleware"
import { ForbiddenError, InternalServerError, NotFoundError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })

routes.get("/:username", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))

    if (username !== req.session.user?.data?.username)
        return next(new ForbiddenError("You are not allowed to access this page."))

    try {
        const user = await User.findOne({ username }).select("-posts")
        if (!user) return next(new NotFoundError("User not found. Try to log into your account again."))

        const latestPosts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).limit(2)

        const postsSummarized = latestPosts.map((post) => {
            return {
                ...post.toObject(),
                content: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")
            }
        })

        const data = {
            title: `Dashboard - ${user.username}`,
            description: `Welcome back, ${user.username}!`,
            user,
            latestPosts: postsSummarized
        }

        return res.render("pages/users/dashboard", data)
    } catch (error) {
        console.error(error)
        return next(new InternalServerError("An error occurred while trying to log into your account."))
    }
})

routes.get("/:username/edit-account", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))

    if (username !== req.session.user?.data?.username)
        return next(new ForbiddenError("You are not allowed to access this page."))

    try {
        const user = await User.findOne({ username }).select("-posts")
        if (!user) return next(new NotFoundError("User not found. Try to log into your account again."))

        const data = {
            title: `Edit Account - ${user.username}`,
            description: `Edit your account, ${user.username}!`,
            user,
            error: null
        }

        return res.render("pages/users/edit-account", data)
    } catch (error) {
        console.error(error)
        return next(new InternalServerError("An error occurred while trying to log into your account."))
    }
})

routes.get("/:username/posts/new-post", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))

    if (username !== req.session.user?.data?.username)
        return next(new ForbiddenError("You are not allowed to access this page."))

    res.locals.user = req.session.user?.data    

    const data = {
        title: `New Post - ${username}`,
        description: `Create a new post, ${username}! Don't forget to read the rules before posting.`,
        user: res.locals.user,
        error: null
    }

    return res.render("pages/users/new-post", data)
})

export default routes

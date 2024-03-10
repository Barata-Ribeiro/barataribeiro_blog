import { NextFunction, Request, Response, Router } from "express"
import Post from "../api/v1/models/Post"
import User from "../api/v1/models/User"
import { parseDate, parseDateToISO } from "../api/v1/utils/Functions"
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

        const latestPosts = await Post.find({ author: user._id })
            .select("-content -tags")
            .sort({ createdAt: -1 })
            .limit(2)

        const data = {
            title: `Dashboard - ${user.username}`,
            description: `Welcome back, ${user.username}!`,
            user,
            latestPosts
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

    const sessionUser = req.session.user?.data

    if (username !== sessionUser?.username) return next(new ForbiddenError("You are not allowed to access this page."))

    if (sessionUser?.role !== "admin") return next(new ForbiddenError("You are not allowed to access this page."))

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

routes.get("/:username/posts", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))

    const sessionUser = req.session.user?.data

    if (username !== sessionUser?.username) return next(new ForbiddenError("You are not allowed to access this page."))

    if (sessionUser?.role !== "admin") return next(new ForbiddenError("You are not allowed to access this page."))

    try {
        const posts = await Post.find()
            .populate({
                path: "author",
                match: { username },
                select: "username displayName -_id"
            })
            .select("-content -tags")
            .sort({ createdAt: -1 })

        const data = {
            title: `Posts - ${username}`,
            description: `Your posts, ${username}. Here you'll see an extensive list of your posts. All of them.`,
            user: sessionUser,
            posts: posts.map((post) => ({
                ...post.toObject(),
                createdAtISO: parseDateToISO(post.createdAt),
                updatedAtISO: parseDateToISO(post.updatedAt),
                createdAt: parseDate(post.createdAt),
                updatedAt: parseDate(post.updatedAt)
            }))
        }

        return res.render("pages/users/posts", data)
    } catch (error) {
        console.error(error)
        return next(new InternalServerError("An error occurred while trying to log into your account."))
    }
})

routes.get("/:username/posts/new-post", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))

    const sessionUser = req.session.user?.data

    if (username !== sessionUser?.username) return next(new ForbiddenError("You are not allowed to access this page."))

    if (sessionUser?.role !== "admin") return next(new ForbiddenError("You are not allowed to access this page."))

    res.locals.user = sessionUser

    const data = {
        title: `New Post - ${username}`,
        description: `Create a new post, ${username}! Don't forget to read the rules before posting.`,
        user: res.locals.user,
        loadPrismJS: true,
        error: null
    }

    return res.render("pages/users/new-post", data)
})

routes.get(
    "/:username/posts/:postId/edit-post",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        const { username, postId } = req.params
        if (!username) return next(new ForbiddenError("Username is missing. Try to log into your account again."))
        if (!postId) return next(new ForbiddenError("Post ID is missing. Try to log into your account again."))

        const sessionUser = req.session.user?.data

        if (username !== sessionUser?.username)
            return next(new ForbiddenError("You are not allowed to access this page."))

        if (sessionUser?.role !== "admin") return next(new ForbiddenError("You are not allowed to access this page."))

        try {
            const post = await Post.findOne({ _id: postId, author: sessionUser._id })
            if (!post) return next(new NotFoundError("Post not found. Try to log into your account again."))

            const data = {
                title: `Edit Post - ${username}`,
                description: `Edit your post, ${username}! Don't forget to read the rules before posting.`,
                user: sessionUser,
                post,
                loadPrismJS: true,
                error: null
            }

            return res.render("pages/users/edit-post", data)
        } catch (error) {
            console.error(error)
            return next(new InternalServerError("An error occurred while trying to log into your account."))
        }
    }
)

export default routes

import { Router } from "express"
import Post from "../api/v1/models/Post"
import User from "../api/v1/models/User"
import authMiddleware from "../middlewares/AuthMiddleware"
import { ForbiddenError, InternalServerError, NotFoundError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })

routes.get("/:username", authMiddleware, async (req, res) => {
    const { username } = req.params
    if (!username) throw new ForbiddenError("Username is missing. Try to log into your account again.")

    try {
        const user = await User.findOne({ username }).select("-posts")
        if (!user) throw new NotFoundError("User not found. Try to log into your account again.")

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
        throw new InternalServerError("An error occurred while trying to log into your account.")
    }
})

export default routes

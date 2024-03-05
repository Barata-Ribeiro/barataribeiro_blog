import { NextFunction, Request, Response, Router } from "express"
import Post from "../api/v1/models/Post"
import { summarizeText } from "../api/v1/utils/Functions"
import { InternalServerError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })

routes.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find()
            .select("-tags -totalViews")
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username displayName -_id" })
            .limit(8)
            .exec()

        if (!posts) {
            return res.status(200).render("index", {
                title: "Home",
                description: "Welcome to the home page.",
                featuredPosts: [],
                nextSixPosts: []
            })
        }

        const summarizedPosts = posts.map((post) => ({
            ...post.toObject(),
            content: summarizeText(post.content, 200)
        }))

        const featuredPosts = summarizedPosts.slice(0, 2)
        const nextSixPosts = summarizedPosts.slice(2, 8)

        const data = {
            title: "Home",
            description: "Welcome to the home page.",
            featuredPosts,
            nextSixPosts
        }

        return res.status(200).render("index", data)
    } catch (error) {
        console.error(error)
        return next(new InternalServerError("An error occurred while trying to load the home page."))
    }
})

export default routes
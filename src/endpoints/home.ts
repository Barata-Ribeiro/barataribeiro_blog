import { NextFunction, Request, Response, Router } from "express"
import Post from "../api/v1/models/Post"
import Tag from "../api/v1/models/Tag"
import { InternalServerError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })

routes.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find()
            .select("-content -tags -totalViews")
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username displayName -_id" })
            .limit(8)

        const tags = await Tag.find().select("name -_id")

        if (!posts || posts.length === 0 || !tags) {
            return res.status(200).render("index", {
                title: "Home",
                description: "Welcome to the home page.",
                featuredPosts: [],
                nextSixPosts: [],
                tags: []
            })
        }

        const featuredPosts = posts.slice(0, 2)
        const nextSixPosts = posts.slice(2, 8)

        const data = {
            title: "Book of Shadows - Home",
            description:
                "Welcome to my Book of Shadows. This blog was created to share my thoughts, ideas, and experiences with anything programming related. I hope you enjoy your stay here and find something that resonates with you.",
            keywords:
                "programming, web development, software development, software engineering, technology, coding, programming languages, software, development, software developer, software engineer, software development blog, programming blog, web development blog, technology blog, software engineering blog, coding blog, programming languages blog, software blog, development blog, software developer blog, software engineer blog",
            featuredPosts,
            nextSixPosts,
            tags
        }

        return res.status(200).render("index", data)
    } catch (error) {
        console.error(error)
        return next(new InternalServerError("An error occurred while trying to load the home page."))
    }
})

export default routes

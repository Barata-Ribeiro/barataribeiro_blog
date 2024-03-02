import DOMPurify from "dompurify"
import { NextFunction, Request, Response, Router } from "express"
import { JSDOM } from "jsdom"
import { marked } from "marked"
import Post from "../api/v1/models/Post"
import { parseDate } from "../api/v1/utils/Functions"
import { NotFoundError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })
const window = new JSDOM("").window
const purify = DOMPurify(window)

routes.get("/:postId/:postTitle", async (req: Request, res: Response, next: NextFunction) => {
    const { postId, postTitle } = req.params
    if (!postId || !postTitle) return next(new NotFoundError("Post not found."))

    const post = await Post.findById({ _id: postId })
        .populate({ path: "author", select: "username displayName -_id" })
        .populate({ path: "tags", select: "name -_id" })
        .exec()
    if (!post) return next(new NotFoundError("Post not found."))
    if (post.title !== postTitle) return next(new NotFoundError("Post not found."))

    post.content = await marked.parse(post.content, {
        gfm: true,
        breaks: true
    })

    post.content = await purify.sanitize(post.content)

    const data = {
        title: post.title,
        description: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
        loadPrismJS: true,
        post: {
            ...post.toObject(),
            createdAt: parseDate(post.createdAt),
            updatedAt: parseDate(post.updatedAt)
        },
        isUserLoggedIn: req.session.user?.isLoggedIn || false,
        username: req.session.user?.isLoggedIn && req.session.user?.data ? req.session.user.data.username : null
    }

    res.status(200).render("pages/posts/post", data)
})

export default routes

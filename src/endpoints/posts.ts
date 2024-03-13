import DOMPurify from "dompurify"
import { NextFunction, Request, Response, Router } from "express"
import { JSDOM } from "jsdom"
import { marked } from "marked"
import { Types } from "mongoose"
import Post from "../api/v1/models/Post"
import Tag from "../api/v1/models/Tag"
import { parseDate, parseDateToISO } from "../api/v1/utils/Functions"
import { NotFoundError } from "../middlewares/helpers/ApiErrors"

const routes = Router({ mergeParams: true })
const window = new JSDOM("").window
const purify = DOMPurify(window)

routes.get("/", async (req: Request, res: Response) => {
    let { tags, page = 1, limit = 10 } = req.query as { tags: string; page: string; limit: string }
    page = Number(page)
    limit = Number(limit)
    const skip = (page - 1) * limit

    let tagIdList: Types.ObjectId[] = []
    let tagNameList: string[] = []
    if (tags) {
        tags = decodeURIComponent(tags)
        const tagList = tags.split(", ")
        const foundTags = await Tag.find({ name: { $in: tagList } })
        tagIdList = foundTags.map((tag) => tag._id)
        tagNameList = foundTags.map((tag) => tag.name)
    }
    const query = tagIdList.length > 0 ? { tags: { $in: tagIdList } } : {}

    const [posts, total] = await Promise.all([
        Post.find(query)
            .select("-content -totalViews")
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username displayName -_id" })
            .populate({ path: "tags", select: "name -_id" })
            .skip(skip)
            .limit(limit),

        Post.countDocuments(query)
    ])

    if (posts.length === 0)
        return res.status(200).render("pages/posts/posts", {
            title: "Posts",
            description:
                "Here you will see the list of all the blog posts. Either all, or filtered through the posts' tags.",
            data: {
                posts: [],
                total: 0,
                perPage: limit,
                currentPage: page,
                nextPage: null,
                prevPage: null
            }
        })

    const serverOrigin = process.env.SERVER_ORIGIN || "http://localhost:3000"
    const basePath = `${serverOrigin}/posts`

    const baseParams = new URLSearchParams({
        ...(tagNameList.length > 0 && { tags: tagNameList.join(", ") }),
        limit: limit.toString()
    })
    const nextPage = page * limit < total ? `${basePath}?${baseParams}&page=${page + 1}` : null
    const prevPage = page > 1 ? `${basePath}?${baseParams}&page=${page - 1}` : null

    const data = {
        title: "Posts",
        description:
            "Here you will see the list of all the blog posts. Either all, or filtered through the posts' tags.",
        data: {
            posts: posts.map((post) => ({
                ...post.toObject(),
                createdAtISO: parseDateToISO(post.createdAt),
                updatedAtISO: parseDateToISO(post.updatedAt),
                createdAt: parseDate(post.createdAt),
                updatedAt: parseDate(post.updatedAt)
            })),
            total,
            perPage: limit,
            currentPage: page,
            nextPage,
            prevPage
        }
    }

    res.status(200).render("pages/posts/posts", data)
})

routes.get("/:postId/:postSlug", async (req: Request, res: Response, next: NextFunction) => {
    const { postId, postSlug } = req.params
    if (!postId || !postSlug) return next(new NotFoundError("Post not found."))

    const post = await Post.findById({ _id: postId })
        .populate({ path: "author", select: "username displayName -_id" })
        .populate({ path: "tags", select: "name -_id" })
    if (!post) return next(new NotFoundError("Post not found."))
    if (post.slug !== postSlug) return next(new NotFoundError("Post not found."))

    post.content = await marked.parse(post.content, {
        gfm: true,
        breaks: true
    })

    post.content = await purify.sanitize(post.content)

    const data = {
        title: `${post.title} | Book of Shadows`,
        description: post.summary + "... Read more on the blog.",
        keywords: post.tags.length > 0 ? post.tags.map((tag: any) => tag.name).join(", ") : "",
        loadPrismJS: true,
        post: {
            ...post.toObject(),
            createdAtISO: parseDateToISO(post.createdAt),
            updatedAtISO: parseDateToISO(post.updatedAt),
            createdAt: parseDate(post.createdAt),
            updatedAt: parseDate(post.updatedAt)
        },
        isUserLoggedIn: req.session.user?.isLoggedIn || false,
        username: req.session.user?.isLoggedIn && req.session.user?.data ? req.session.user.data.username : null
    }

    res.status(200).render("pages/posts/post", data)
})

export default routes

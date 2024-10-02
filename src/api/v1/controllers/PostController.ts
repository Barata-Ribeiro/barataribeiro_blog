import { NextFunction, Request, Response } from "express"
import mongoose, { ObjectId } from "mongoose"
import { ForbiddenError, InternalServerError, NotFoundError } from "../../../middlewares/helpers/ApiErrors"
import Post from "../models/Post"
import Tag from "../models/Tag"
import User, { User as IUser } from "../models/User"
import { parseDate, parseDateToISO } from "../utils/Functions"

export class PostController {
    public async getPostsForPortfolio(req: Request, res: Response) {
        try {
            const allowedOrigin = "https://barataribeiro.com/"
            const requestOrigin = req.headers.origin
            if (requestOrigin !== allowedOrigin)
                return res.sendStatus(403).json({
                    success: false,
                    message: "Forbidden. Access denied."
                })

            const twoLatestPosts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(2)
                .populate("tags", "name -_id")
                .populate("author", "username displayName -_id")
            if (twoLatestPosts.length <= 0)
                return res.sendStatus(204).json({
                    success: true,
                    message: "No posts found."
                })

            const parsedPosts = twoLatestPosts.map((post) => ({
                ...post.toObject(),
                createdAtISO: parseDateToISO(post.createdAt),
                updatedAtISO: parseDateToISO(post.updatedAt),
                createdAt: parseDate(post.createdAt),
                updatedAt: parseDate(post.updatedAt)
            }))

            return res.sendStatus(200).json({
                success: true,
                message: "Posts fetched successfully.",
                data: parsedPosts
            })
        } catch (error) {
            console.error(error)
            return res.sendStatus(500).json({
                success: false,
                message: "An error occurred while fetching posts."
            })
        }
    }

    public async deletePost(req: Request, res: Response, next: NextFunction) {
        if (!req.session.user) return res.redirect("/auth/logout")

        const sessionUser = req.session.user?.data as IUser
        const { postId } = req.params
        if (!postId) return next(new NotFoundError("Missing post ID."))

        if (sessionUser.role !== "admin") return next(new ForbiddenError("You are not authorized to delete this post."))

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const post = await Post.findById(postId).populate("author", "_id username")
            if (!post) {
                await session.abortTransaction()
                await session.endSession()
                return next(new NotFoundError("Post not found."))
            }

            if (!post.author || post.author._id.toString() !== (sessionUser._id as ObjectId).toString()) {
                await session.abortTransaction()
                await session.endSession()
                return next(new ForbiddenError("You are not the author of this post."))
            }

            await User.updateOne({ _id: sessionUser._id }, { $pull: { posts: post._id } }, { session })
            await Tag.updateMany({}, { $pull: { posts: post._id } }, { session })
            await post.deleteOne({ session })

            await session.commitTransaction()
            await session.endSession()

            res.sendStatus(200).redirect(`/dashboard/${sessionUser.username}`)
        } catch (error) {
            await session.abortTransaction()
            await session.endSession()
            console.error(error)
            return next(new InternalServerError("An error occurred while deleting the post"))
        }
    }
}

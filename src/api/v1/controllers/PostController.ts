import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { ForbiddenError, InternalServerError, NotFoundError } from "../../../middlewares/helpers/ApiErrors"
import Post from "../models/Post"
import Tag from "../models/Tag"
import User, { User as IUser } from "../models/User"

export class PostController {
    public async deletePost(req: Request, res: Response, next: NextFunction) {
        if (!req.session.user) return res.redirect("/auth/logout")

        const sessionUser = req.session.user?.data as IUser
        const { postId } = req.params
        if (!postId) return next(new NotFoundError("Missing post ID."))

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const post = await Post.findById(postId).populate("author", "_id username")
            if (!post) {
                await session.abortTransaction()
                session.endSession()
                return next(new NotFoundError("Post not found."))
            }

            if (!post.author || post.author._id.toString() !== sessionUser._id.toString()) {
                await session.abortTransaction()
                session.endSession()
                return next(new ForbiddenError("You are not the author of this post."))
            }

            await User.updateOne({ _id: sessionUser._id }, { $pull: { posts: post._id } }, { session })
            await Tag.updateMany({}, { $pull: { posts: post._id } }, { session })
            await post.deleteOne({ session })

            await session.commitTransaction()
            session.endSession()

            res.status(200).redirect(`/dashboard/${sessionUser.username}`)
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            console.error(error)
            return next(new InternalServerError("An error occurred while deleting the post"))
        }
    }
}

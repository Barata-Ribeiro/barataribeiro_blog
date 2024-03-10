import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import {
    UserCreatePostRequestBody,
    UserEditPostRequestBody,
    UserEditRequestBody
} from "../../../interfaces/UserInterfaces"
import { ForbiddenError, InternalServerError, NotFoundError } from "../../../middlewares/helpers/ApiErrors"
import Post from "../models/Post"
import Tag from "../models/Tag"
import User, { User as IUser } from "../models/User"
import { UserService } from "../services/UserService"
export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    async updateAccount(req: Request, res: Response) {
        const sessionUser = req.session.user?.data as IUser
        if (!req.session.user) return res.redirect("/auth/logout")

        const data = {
            title: `Edit Account - ${sessionUser.username}`,
            description: `Edit your account, ${sessionUser.username}!`,
            user: sessionUser,
            error: null
        }

        const { username } = req.params
        if (!username)
            return res.render("pages/users/edit-account", {
                ...data,
                error: "Username is missing. Try to log into your account again."
            })

        const requestingBody = req.body as UserEditRequestBody
        if (!requestingBody)
            return res.render("pages/users/edit-account", { ...data, error: "You have not provided any data." })

        if (!requestingBody.currentPassword)
            return res.render("pages/users/edit-account", { ...data, error: "You must provide your current password." })

        const response = await this.userService.updateAccount(username, requestingBody)
        if (response.error) return res.render("pages/users/edit-account", { ...data, error: response.error })

        if (response.user) {
            req.session.user.data = response.user

            return req.session.save((err) => {
                if (err) {
                    console.error(err)
                    return res.render("pages/users/edit-account", { ...data, error: "Failed to save session." })
                }

                res.locals.user = response.user
                return res.status(302).redirect(`/dashboard/${response.user.username}`)
            })
        }

        return res.render("pages/users/edit-account", {
            ...data,
            error: "An unexpected error occurred."
        })
    }

    async createPost(req: Request, res: Response) {
        const sessionUser = req.session.user?.data as IUser
        if (!req.session.user) return res.redirect("/auth/logout")

        const data = {
            title: `Create a new post - ${sessionUser.username}`,
            description: `Time to post something, ${sessionUser.username}!`,
            user: sessionUser,
            error: null
        }

        const { username } = req.params
        if (!username)
            return res.render("pages/users/new-post", {
                ...data,
                error: "Username is missing. Try to log into your account again."
            })

        const requestingBody = req.body as UserCreatePostRequestBody
        if (!requestingBody)
            return res.render("pages/users/new-post", { ...data, error: "You have not provided any data." })

        const response = await this.userService.createPost(username, requestingBody)
        if (response.error) return res.render("pages/users/new-post", { ...data, error: response.error })

        if (response.post) return res.redirect(`/posts/${response.post.id}/${response.post.slug}`)

        return res.render("pages/users/new-post", {
            ...data,
            error: "An unexpected error occurred."
        })
    }

    async editPost(req: Request, res: Response) {
        const sessionUser = req.session.user?.data as IUser
        if (!req.session.user) return res.redirect("/auth/logout")

        const data = {
            title: `Edit Post - ${sessionUser.username}`,
            description: `Edit your post, ${sessionUser.username}!`,
            user: sessionUser,
            error: null
        }

        const { username, postId } = req.params
        if (!username)
            return res.render("pages/users/edit-post", {
                ...data,
                error: "Username is missing. Try to log into your account again."
            })

        if (!postId)
            return res.render("pages/users/edit-post", {
                ...data,
                error: "Post ID is missing. Try to log into your account again."
            })

        const requestingBody = req.body as UserEditPostRequestBody
        if (!requestingBody)
            return res.render("pages/users/edit-post", { ...data, error: "You have not provided any data." })

        console.log("Starting to edit post...")
        const response = await this.userService.editPost(username, postId, requestingBody)
        if (response.error) return res.render("pages/users/edit-post", { ...data, error: response.error })
        console.log("Finished editing post...")

        if (response.post) return res.redirect(`/posts/${response.post.id}/${response.post.slug}`)

        return res.render("pages/users/edit-post", {
            ...data,
            error: "An unexpected error occurred."
        })
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction) {
        if (!req.session.user) return res.redirect("/auth/logout")

        const sessionUser = req.session.user?.data as IUser
        const { username } = req.params
        if (!username) return next(new NotFoundError("Missing post ID."))

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const userToDelete = await User.findOne({ username })
            if (!userToDelete) {
                await session.abortTransaction()
                session.endSession()
                return next(new NotFoundError("User not found."))
            }

            if (userToDelete._id.toString() !== sessionUser._id.toString()) {
                await session.abortTransaction()
                session.endSession()
                return next(new ForbiddenError("You are not authorized to delete this account."))
            }

            await Tag.updateMany({}, { $pull: { posts: { author: userToDelete._id } } }, { session })
            await Post.deleteMany({ author: userToDelete._id }, { session })
            await userToDelete.deleteOne({ session })

            await session.commitTransaction()
            session.endSession()

            return res.status(204).redirect("/auth/logout")
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            console.error(error)
            return next(new InternalServerError("An error occurred while deleting your account."))
        }
    }
}

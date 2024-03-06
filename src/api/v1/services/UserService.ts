import mongoose from "mongoose"
import { UserCreatePostRequestBody, UserEditRequestBody } from "../../../interfaces/UserInterfaces"
import Post from "../models/Post"
import Tag from "../models/Tag"
import User from "../models/User"
import { generateSlug } from "../utils/Functions"

export class UserService {
    async updateAccount(username: string, requestingBody: UserEditRequestBody) {
        const {
            username: newUsername,
            displayName,
            email,
            newPassword,
            confirmNewPassword,
            bio,
            currentPassword
        } = requestingBody

        try {
            const user = await User.findOne({ username }).select("+password")
            if (!user) return { error: "User not found." }

            const passwordMatches = await user.comparePassword(currentPassword!)
            if (!passwordMatches) return { error: "Current password is incorrect." }

            if (newUsername) {
                const usernameAlreadyTaken = await User.exists({ username: newUsername })
                if (usernameAlreadyTaken) return { error: "Username already taken." }

                if (username === newUsername) return { error: "New username is the same as the current one." }

                user.username = newUsername
            }

            if (displayName) user.displayName = displayName.trim()

            if (email) {
                const emailAlreadyTaken = await User.exists({ email })
                if (emailAlreadyTaken) return { error: "Email already in use." }

                user.email = email
            }

            if (newPassword && confirmNewPassword) {
                if (newPassword !== confirmNewPassword) return { error: "New passwords do not match." }

                const hashedNewPassword = await user.hashPassword(newPassword)

                user.password = hashedNewPassword
            }

            if (bio) user.bio = bio.trim()

            const savedUser = await user.save()
            if (!savedUser) return { error: "Failed to save user." }

            return { user: savedUser, error: null }
        } catch (error) {
            console.error(error)
            return { error: "An error occurred while updating the account." }
        }
    }

    async createPost(username: string, requestingBody: UserCreatePostRequestBody) {
        const { title, content, summary, tags } = requestingBody
        if (!title || !content || !tags) return { error: "You must provide a title, content, and tags." }

        try {
            const user = await User.findOne({ username })
            if (!user) return { error: "User not found." }

            if (!user.posts) user.posts = []

            const tagsArray = tags.split(", ").map((tag) => tag.trim())
            const tagsIds = await Promise.all(
                tagsArray.map(async (tagName) => {
                    let tag = await Tag.findOne({ name: tagName })
                    if (!tag) tag = await Tag.create({ name: tagName })

                    return tag._id
                })
            )

            const slug = generateSlug(title)

            const post = await Post.create({ title, summary, content, slug, author: user._id, tags: tagsIds })
            if (!post) return { error: "Failed to create the post." }

            const associateTagsToPost = await Promise.all(
                tagsIds.map(async (tagId) => {
                    const tag = await Tag.findById(tagId)
                    if (!tag) return { error: "Failed to associate tags to the post." }

                    tag.posts.push(post._id)
                    return tag.save()
                })
            )
            if (associateTagsToPost.some((tag) => !tag)) return { error: "Failed to associate tags to the post." }

            user.posts.push(post._id)
            await user.save()

            return { post, error: null }
        } catch (error) {
            console.error(error)
            if (error instanceof mongoose.Error.ValidationError) {
                const messages = Object.values(error.errors).map(
                    (err) => `${err.name}: ${err.path.charAt(0).toUpperCase() + err.path.slice(1)} - ${err.message}.`
                )
                return { error: messages.join(" ") }
            }
            return { error: "An error occurred while creating your post." }
        }
    }
}

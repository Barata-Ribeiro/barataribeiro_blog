import bcrypt from "bcrypt"
import { UserEditRequestBody } from "../../../interfaces/UserInterfaces"
import { ConflictError, InternalServerError, NotFoundError } from "../../../middlewares/helpers/ApiErrors"
import User from "../models/User"

export class UserService {
    async updateUser(username: string, requestingBody: UserEditRequestBody) {
        const { username: newUsername, displayName, password, bio } = requestingBody
        try {
            const user = await User.findOne({ username })
            if (!user) throw new NotFoundError("User not found.")

            if (newUsername) {
                const checkIfUsernameExists = await User.exists({ username: newUsername })
                if (checkIfUsernameExists) throw new ConflictError("An account with this username already exists.")

                user.username = newUsername
            }
            if (displayName) user.displayName = displayName
            if (password) {
                const salt = bcrypt.genSaltSync(10)
                const hashPassword = bcrypt.hashSync(password, salt)
                user.password = hashPassword
            }
            if (bio) user.bio = bio

            await user.save()

            return user
        } catch (error) {
            console.error(error)
            throw new InternalServerError("Failed to update your account.")
        }
    }
}

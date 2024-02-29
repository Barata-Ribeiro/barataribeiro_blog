import { UserEditRequestBody } from "../../../interfaces/UserInterfaces"
import User from "../models/User"

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
}

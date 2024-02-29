export interface UserEditRequestBody {
    username?: string
    displayName?: string
    email?: string
    newPassword?: string
    confirmNewPassword?: string
    bio?: string
    currentPassword?: string
}

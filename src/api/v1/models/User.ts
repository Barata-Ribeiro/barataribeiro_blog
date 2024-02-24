import bcrypt from "bcrypt"
import mongoose from "mongoose"

interface User extends Document {
    username: string
    email: string
    password: string
    bio?: string
    role: "user" | "admin"
    posts: mongoose.Schema.Types.ObjectId[]
    hashPassword(password: string): string
    comparePassword(candidatePassword: string): boolean
}

const Schema = mongoose.Schema
const UserSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/^[a-zA-Z0-9]+$/, "is invalid"],
            index: true
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "is invalid"],
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        bio: String,
        role: {
            type: String,
            default: "user",
            enum: ["user", "admin"]
        },
        posts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
    },
    { timestamps: true }
)

UserSchema.methods.hashPassword = function (password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

UserSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compareSync(password, this.password)
}

export default mongoose.model<User>("User", UserSchema, "users")

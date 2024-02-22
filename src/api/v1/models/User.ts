import mongoose from "mongoose"

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
export default mongoose.model("User", UserSchema)

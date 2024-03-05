import mongoose from "mongoose"

const Schema = mongoose.Schema
const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "is required"],
            index: true
        },
        summary: {
            type: String,
            required: [true, "is required"],
            maxlength: [150, "cannot be longer than 150 characters"]
        },
        content: {
            type: String,
            required: [true, "is required"]
        },
        slug: {
            type: String,
            lowercase: true,
            required: true,
            unique: true
        },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        totalViews: { type: Number, default: 0 }
    },
    { timestamps: true }
)
export default mongoose.model("Post", PostSchema)

import mongoose from "mongoose"

const Schema = mongoose.Schema
const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            index: true
        },
        content: {
            type: Text,
            required: [true, "Content is required"]
        },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }]
    },
    { timestamps: true }
)
export default mongoose.model("Post", PostSchema)

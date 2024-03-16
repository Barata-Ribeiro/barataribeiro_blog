import mongoose from "mongoose"

const Schema = mongoose.Schema
const TagSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "is required"],
            unique: true
        },
        slug: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            index: true
        },
        posts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
    },
    { timestamps: true }
)
export default mongoose.model("Tag", TagSchema)

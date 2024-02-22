import mongoose from "mongoose"

const Schema = mongoose.Schema
const TagSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            index: true
        },
        posts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
    },
    { timestamps: true }
)
export default mongoose.model("Tag", TagSchema)

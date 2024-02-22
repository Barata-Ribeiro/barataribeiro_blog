import mongoose from "mongoose"

const connectToDatabase = async () => {
    try {
        const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test"
        await mongoose.connect(URI)
        console.log("Connecting to the database...")
    } catch (error) {
        console.error("Failed to connect to the database: ", error)
        throw new Error("Failed to connect to the database: " + error)
    }
}

export default connectToDatabase

import mongoose from "mongoose"

export const connectToDatabase = async () => {
    try {
        const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test"
        const dbName = process.env.MONGODB_DBNAME || "test"
        await mongoose.connect(URI, { dbName })
        console.log("Connecting to the database...")
    } catch (error) {
        console.error("Failed to connect to the database: ", error)
        throw new Error("Failed to connect to the database: " + error)
    }
}

export const connection = mongoose.connection
    .on("open", () => console.log("The goose is open"))
    .on("close", () => console.log("The goose is closed"))
    .on("error", (error) => {
        console.log(error)
        process.exit()
    })

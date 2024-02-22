// Dependency Imports
import bodyParser from "body-parser"
import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import errorHandler from "errorhandler"
import express from "express"
import expressLayouts from "express-ejs-layouts"
import session from "express-session"
import helmet from "helmet"
import methodOverride from "method-override"
import logger from "morgan"
import path from "path"
import favicon from "serve-favicon"

// Custom Imports
import connectToDatabase from "./api/v1/config/database"

// Custom Middleware
import SetCurrentYear from "./middlewares/CurrentYear"
import SetCacheControl from "./middlewares/SetCacheControl"

const startServer = async () => {
    try {
        let app = express()
        const PORT = process.env.PORT || 3000
        let ENV = process.env.NODE_ENV || "development"

        await connectToDatabase()

        app.set("port", PORT)
        app.set("trust proxy", 1)
        const corsOptions: cors.CorsOptions = {
            origin: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            allowedHeaders: ["Accept", "Authorization", "Content-Type", "X-Refresh-Token"],
            credentials: true
        }
        app.use(cors(corsOptions))
        app.use(favicon(path.join(__dirname, "..", "public/assets", "favicon.ico")))
        app.use(logger("dev"))
        app.use(methodOverride())
        app.use(cookieParser())
        app.use(
            session({
                name: "session_id",
                resave: true,
                saveUninitialized: true,
                secret: process.env.SESSION_SECRET_KEY || "session_secret_test_key",
                cookie: {
                    secure: true,
                    httpOnly: true,
                    sameSite: "strict",
                    domain: process.env.SESSION_DOMAIN || "http://localhost:3000",
                    path: process.env.SESSION_PATH || "/",
                    maxAge: 1 * 24 * 60 * 60 * 1000
                }
            })
        )
        app.use(helmet({ crossOriginResourcePolicy: false }))
        app.use(helmet.noSniff())
        app.use(helmet.xssFilter())
        app.use(helmet.ieNoOpen())
        app.disable("x-powered-by")
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(SetCacheControl)
        app.use(compression({ level: 6, threshold: 100 * 1000 }))
        app.use(express.static(path.join(__dirname, "..", "public")))

        app.use(expressLayouts)
        app.set("layout", "./layouts/main")
        app.set("views", path.join(__dirname, "views"))
        app.set("view engine", "ejs")

        app.use(SetCurrentYear)

        app.get("/", function (_req, res, _next) {
            res.render("index", { title: "Express", description: "Welcome to Express" })
        })

        if (app.get("env") === "development") app.use(errorHandler())

        app.listen(PORT, () => {
            console.log(`Service is running on port ${PORT}, enjoy!`)
            if (ENV === "production") console.log("Service is running in production mode.")
            else console.log(`Service in running in ${ENV} mode.`)
        })
    } catch (error) {
        console.error("Error while starting the server: ", error)
        throw new Error("Failed to start the server: " + error)
    }
}

startServer().catch((err) => console.error("Failed to start the server:", err))

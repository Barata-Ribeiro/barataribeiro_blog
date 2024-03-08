// Dependency Imports
import bodyParser from "body-parser"
import compression from "compression"
import MongoStore from "connect-mongo"
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
import { v4 as uuidv4 } from "uuid"

// Custom Imports
import { connectToDatabase, connection } from "./api/v1/config/database"
import authRoutes from "./api/v1/routes/AuthRoutes"
import postsRoutes from "./api/v1/routes/PostsRoutes"
import usersRoutes from "./api/v1/routes/UsersRoutes"
import endpointAuth from "./endpoints/auth"
import endpointUsers from "./endpoints/dashboard"
import endpointHome from "./endpoints/home"
import endpointPosts from "./endpoints/posts"

// Custom Middleware
import SetCurrentYear from "./middlewares/CurrentYear"
import errorMiddleware from "./middlewares/ErrorMiddleware"
import SetCacheControl from "./middlewares/SetCacheControl"

const startServer = async () => {
    try {
        let app = express()
        const PORT = process.env.PORT || 3000
        let ENV = process.env.NODE_ENV || "development"

        const DATA_REPO_ID = process.env.DATA_REPO_ID
        const DATA_CATEGORY_ID = process.env.DATA_CATEGORY_ID

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
                genid: (_req) => uuidv4(),
                secret: process.env.SESSION_SECRET_KEY || "session_secret_test_key",
                resave: true,
                saveUninitialized: false,
                cookie: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 1 * 24 * 60 * 60 * 1000
                },
                store: MongoStore.create({
                    client: connection.getClient() as any,
                    dbName: process.env.MONGODB_DBNAME || "test",
                    collectionName: "sessions",
                    stringify: false,
                    autoRemove: "interval",
                    autoRemoveInterval: 10,
                    ttl: 1 * 24 * 60 * 60
                })
            })
        )
        app.use((_req, res, next) => (res.locals.nonce = uuidv4()) && next())
        app.use((_req, res, next) => {
            res.locals.dataRepoId = DATA_REPO_ID
            res.locals.dataCategoryId = DATA_CATEGORY_ID
            next()
        })
        app.use(
            helmet({
                crossOriginResourcePolicy: false,
                contentSecurityPolicy: {
                    directives: {
                        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                        "script-src": ["'self'", (_req, res) => `'nonce-${(res as express.Response).locals.nonce}'`],
                        "frame-src": ["'self'", "https://giscus.app/"]
                    }
                }
            })
        )
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
        app.use(SetCurrentYear)
        app.set("layout", "./layouts/main")
        app.set("views", path.join(__dirname, "views"))
        app.set("view engine", "ejs")

        app.use((req, res, next) => {
            const isLoggedIn = req.session.user?.isLoggedIn
            if (isLoggedIn) res.locals.user = req.session.user?.data
            else res.locals.user = null
            next()
        })

        // API ENDPOINTS
        app.use("/auth", authRoutes)
        app.use("/dashboard", usersRoutes)
        app.use("/posts", postsRoutes)

        // VIEW ENDPOINTS
        app.use("/", endpointHome)
        app.use("/auth", endpointAuth)
        app.use("/dashboard", endpointUsers)
        app.use("/posts", endpointPosts)

        // PAGE 404
        app.use((_req, res) =>
            res.status(404).render("pages/errors/404", { title: "404 - Not Found", description: "Page not found" })
        )

        app.use(errorMiddleware)

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

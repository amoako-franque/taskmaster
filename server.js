const express = require("express")
const cors = require("cors")
const path = require("path")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const mongoSanitize = require("express-mongo-sanitize")
const fs = require("fs")
const corsOptions = require("./config/corsOptions")
// const db_connection = require("./config/db")
const { errorHandler, notFound } = require("./middlewares /errorHandler")
const { morganMiddleware, systemLogs } = require("./middlewares /logger")
const app = express()
require("dotenv").config()

const port = process.env.PORT || 46800

app.use("/uploads", express.static(path.join(__dirname, "/uploads")))

// db_connection()

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"))
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(morganMiddleware)

app.use(express.static("public"))

app.get("/", (req, res) => {
	res.send("hello from simple server :)")
})

fs.readdirSync(path.join(__dirname, "routes")).map((file) => {
	const route = require(`./routes/${file}`)
	app.use("/api/v1", route)
})

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
	console.log(`> Server is up and running on port :  http://localhost:${port} `)
	systemLogs.info(
		`>> Server is up and running  http://localhost:${port} `.green
	)
})

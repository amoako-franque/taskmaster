const express = require("express")
require("dotenv").config()

const port = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api", require("./routes/authRoutes"))
app.get("/", (req, res) => {
	res.send("hello from simple server :)")
})

app.listen(port, () =>
	console.log(`> Server is up and running on port : http://localhost:${port}`)
)

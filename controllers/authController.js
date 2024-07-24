const expressAsyncHandler = require("express-async-handler")

exports.register = expressAsyncHandler(async (req, res) => {
	res.send("Register")
})

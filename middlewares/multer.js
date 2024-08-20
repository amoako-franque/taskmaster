const fs = require("fs")
const multer = require("multer")
const path = require("path")
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_KEY,
    api_secret:process.env.CLOUD_SECRET
})

if (!fs.existsSync("./uploads")) {
	fs.mkdirSync("./uploads")
}

const storage = multer.memoryStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads")
	},
	filename: function (req, file, cb) {
		cb(
			null,
			`${file.originalname.split(".")[0]}-${Date.now()}${path.extname(
				file.originalname
			)}`
		)
	},
})

const checkImageType = (file, cb) => {
	const filetypes = /jpeg|jpg|png/
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

	const mimetype = filetypes.test(file.mimetype)

	if (extname && mimetype) {
		return cb(null, true)
	} else {
		cb(
			new Error(
				"Unsupported file format. You can only upload jpeg, jpg and png files."
			),
			false
		)
	}
}

const upload = multer({
	storage,
	limit: { fileSize: 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname)
		if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
			cb(new Error("File uploaded is not supported"), false)
			return
		}
		cb(null, true)
	},
})

const uploadCloud = async (req, res, next) => {
    try {
        const file = req.file;
        if(!file){
            return res.status(400).json({msg:"No file uploaded"})
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: "uploads",
            },
            (error, result) => {
                if (result) {
                    req.cloudinaryUrl = result.secure_url;
                    next();
                } else {
                    console.error(error);
                    res.status(500).json({ msg: "Error uploading file to Cloudinary" });
                }
            }
        );
        stream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json('Error uploading file to cloudinary');
    }
};


module.exports = {upload,uploadCloud}
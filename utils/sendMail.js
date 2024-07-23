const nodemailer = require("nodemailer")

const sendMail = async (data) => {
	let transporter = nodemailer.createTransport({
		host: process.env.NODEMAILER_HOST,
		service: process.env.NODEMAILER_SERVICE,
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.USER_MAIL_ID,
			pass: process.env.USER_SECRET,
		},
	})

	await transporter.sendMail({
		from: "Hey 👻 noreply@taskmanager.com",
		to: data.to,
		replyTo: data.replyTo,
		subject: data.subject,
		text: data.text,
		html: data.html,
		attachments: data.attachments,
	})
	// res.status(200).json({
	// 	message: "Email sent successfully",
	// })
}

module.exports = sendMail

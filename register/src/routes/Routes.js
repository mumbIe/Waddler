"use strict"

const _ = require("underscore")

const hashPassword = (pass) => {
	return require("keccak")("keccak256").update(pass).digest("hex")
}

const handleRegister = (body, database, res) => {
	const [username, password, color] = [body.username, body.password, body.color]

	if (_.escape(username) !== username || _.escape(password) !== password) return res.code(200).send("Your username/password contains illegal characters")
	if (isNaN(color)) return

	database.insertPenguin(username, hashPassword(password), color).then((result) => {
		const penguinID = parseInt(result)

		database.addColor(penguinID, color).then(() => {
			database.addPostcard(penguinID).then(() => {
				console.log(`${username} registered`)

				return res.code(200).send(`Successfully registered with the username ${username}`)
			})
		})
	}).catch((err) => {
		if (err.code === "ECONNREFUSED") {
			console.log("Couldn't connect to MySQL, possibly because of incorrect configuration or it isn't running")
			process.exit(1)
		} else {
			console.log(err)
		}

		return res.code(200).send("That username already exists!")
	})
}

module.exports = function(fastify, opts, next) {
	fastify.post("/registerPost", (req, res) => {
		return handleRegister(req.body, opts.database, res)
	})
	next()
}
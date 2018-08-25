"use strict"

const config = require("./config")

class Database {
	constructor() {
		this.knex = require("knex")({
			client: config.client,
			connection: {
				"host": config.host,
				"user": config.user,
				"password": config.pass,
				"database": config.database
			}
		})
	}

	getTime() {
		const date = new Date()
		return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
	}

	usernameExists(username) {
		return this.knex("penguins").count().first().where({
			username
		})
	}

	insertPenguin(username, hash, color) {
		return this.knex("penguins").insert({
			username: username,
			password: hash,
			registrationDate: this.getTime(),
			color: color,
			igloos: "1",
			cover: "1%1%1%1%"
		})
	}

	addColor(ID, color) {
		return this.knex("inventory").insert({
			ID: ID,
			itemID: color
		})
	}

	addPostcard(ID) {
		return this.knex("mail").insert({
			recipientID: ID,
			senderName: "sys",
			senderID: 0,
			details: "",
			date: this.getTime(),
			type: 125
		})
	}
}

module.exports = Database
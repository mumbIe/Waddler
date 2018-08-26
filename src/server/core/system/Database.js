"use strict"

const config = require("../../../config").Database

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

	doesIDExist(ID) {
		return this.knex("penguins").count().where({
			ID
		})
	}

	getPlayer(player) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex("penguins").first("*").where(type, player)
	}

	updateColumn(player, column, value, table) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex(table === undefined ? "penguins" : table).update(column, value).where(type, player).then(() => {})
	}

	getColumn(player, column, table) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex(table === undefined ? "penguins" : table).select(column).where(type, player)
	}
}

module.exports = Database
"use strict"

const config = require("../../../config")

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

	getPlayer(player) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex("penguins").first("*").where(type, player)
	}

	getUsernameById(ID) {
		return this.knex("penguins").select("username").where({
			ID
		})
	}

	updateColumn(player, column, value, table) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex(table == null ? "penguins" : table).update(column, value).where(type, player).then(() => {}).catch((err) => {
			console.error(err)
		})
	}
	getColumn(player, column, table) {
		const type = isNaN(player) ? "username" : "ID"

		return this.knex(table == null ? "penguins" : table).select(column).where(type, player)
	}

	insertItem(ID, item) {
		return this.knex("inventory").insert({
			ID: ID,
			itemID: item
		}).catch((err) => {
			console.error(err)
		})
	}

	updateQuantity(ID) {
		return this.knex.raw("UPDATE `furniture` SET `quantity` = quantity + ? WHERE `ID` = ?", [1, ID]).then(() => {}).catch((err) => {
			console.error(err)
		})
	}
	insertFurniture(ID, furnitureID) {
		return this.knex("furniture").insert({
			ID: ID,
			furnitureID: furnitureID,
			quantity: 1
		})
	}
	getFurnitureAndQuantity(ID) {
		return this.knex("furniture").select("furnitureID", "quantity").where({
			ID
		})
	}
	getActiveIgloo(ID) {
		return this.knex("igloo").select("*").where({
			ID
		})
	}
	addIgloo(ID, igloo) {
		return this.knex.raw('UPDATE `penguins` SET `igloos` =' + `concat(igloos, "|", ${igloo})` + 'WHERE `ID` = ?', [ID]).then(() => {}).catch((err) => {
			console.error(err)
		})
	}

	getIgnored(ID) {
		return this.knex("ignored").select("ignoredID", "ignoredUsername").where({
			ID
		})
	}
	alreadyIgnored(toIgnore) {
		return this.knex("ignored").select("*").where("ignoredID", toIgnore)
	}
	addIgnore(ID, toIgnore, usernameToIgnore) {
		return this.knex("ignored").insert({
			ID: ID,
			ignoredID: toIgnore,
			ignoredUsername: usernameToIgnore
		})
	}
	removeIgnore(ID, toRemove, usernameToRemove) {
		return this.knex("ignored").del().where({
			ID: ID,
			ignoredID: toRemove,
			ignoredUsername: usernameToRemove
		})
	}
}

module.exports = Database
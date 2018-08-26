"use strict"

const item_crumbs = require("../crumbs/items")
const furniture_crumbs = require("../crumbs/furniture")
const igloo_crumbs = require("../crumbs/igloos")
const floor_crumbs = require("../crumbs/floors")
const stamp_crumbs = require("../crumbs/stamps")

class ClubPenguin {
	constructor() {

	}

	addCoins(coins) {
		if (isNaN(coins)) return

		this.coins += coins
		this.updateColumn("coins", this.coins)
	}

	removeCoins(coins) {
		if (isNaN(coins)) return

		this.coins -= coins
		this.updateColumn("coins", this.coins)
	}

	addItem(itemID) {
		if (this.server.isPluginEnabled("PatchedItems")) {
			if (this.server.getPlugin("PatchedItems").containsBaitItem(itemID) && !this.moderator) {
				return this.sendError(410)
			}
		}

		if (this.inventory.includes(itemID)) return this.sendError(400)
		if (!item_crumbs[itemID]) return this.sendError(402)

		const cost = item_crumbs[itemID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.inventory.push(itemID)

		this.knex("inventory").insert({
			ID: this.id,
			itemID: itemID
		}).then(() => {
			this.sendXt("ai", -1, itemID, this.coins)
		})
	}

	addFurniture(furnitureID) {
		if (!furniture_crumbs[furnitureID]) return this.sendError(402)

		const cost = furniture_crumbs[furnitureID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.getColumn("furnitureID", "furniture").then((result) => {
			if (result.length !== 0) {
				this.knex.raw("UPDATE `furniture` SET `quantity` = quantity + ? WHERE `ID` = ?", [1, this.id]).then(() => {})
			} else {
				this.knex("furniture").insert({
					ID: this.id,
					furnitureID: furnitureID,
					quantity: 1
				}).then(() => {})
			}

			this.sendXt("af", -1, furnitureID, this.coins)
		})
	}

	addIgloo(iglooID) {
		if (!igloo_crumbs[iglooID]) return this.sendError(402)

		const cost = igloo_crumbs[iglooID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.getColumn("igloos").then((result) => {
			let igloos = []

			for (const i of result[0].igloos.split("|")) igloos.push(parseInt(i))

			if (igloos.includes(iglooID)) return this.sendError(500)

			this.knex.raw('UPDATE `penguins` SET `igloos` =' + `concat(igloos, "|", ${iglooID})` + 'WHERE `ID` = ?', [this.id]).then(() => {})

			if (this.room.id === (this.id + 1000)) this.sendXt("au", -1, iglooID, this.coins)
		})
	}

	addFloor(floorID) {
		if (!floor_crumbs[floorID]) return this.sendError(402)

		const cost = floor_crumbs[floorID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.updateColumn("floor", floorID, "igloo")
		this.sendXt("ag", -1, floorID, this.coins)
	}

	addStamp(stampID) {
		if (isNaN(stampID)) return

		if (!stamp_crumbs[stampID]) return
		if (this.stamps.includes(stampID)) return

		this.knex("stamps").insert({
			ID: this.id,
			stampID: stampID
		}).then(() => {
			this.sendXt("aabs", -1, stampID)
			this.stamps.push(stampID)
		})
	}
}

module.exports = ClubPenguin
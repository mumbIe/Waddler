"use strict"

class ClubPenguin {
	constructor() {}

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

		const items = require("../crumbs/items")

		if (!items[itemID]) return this.sendError(402)

		const cost = items[itemID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.inventory.push(itemID)
		this.database.insertItem(this.id, itemID)
		this.sendXt("ai", -1, itemID, this.coins)
	}

	addFurniture(furnitureID) {
		const furniture = require("../crumbs/furniture")

		if (!furniture[furnitureID]) return this.sendError(402)

		const cost = furniture[furnitureID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.getColumn("furnitureID", "furniture").then((result) => {
			result.length != 0 ? this.database.updateQuantity(this.id) : this.database.insertFurniture(this.id, furnitureID)

			this.sendXt("af", -1, furnitureID, this.coins)
		})
	}

	addIgloo(iglooID) {
		const igloos = require("../crumbs/igloos")

		if (!igloos[iglooID]) return this.sendError(402)

		const cost = igloos[iglooID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.database.alreadyOwnsIgloo(this.id).then((result) => {
			let igloos = []

			for (const i of result[0].igloos.split("|")) igloos.push(parseInt(i))

			if (igloos.includes(iglooID)) return this.sendError(500)

			this.database.addIgloo(this.id, iglooID)

			if (this.room.id === (this.id + 1000)) this.sendXt("au", -1, iglooID, this.coins)
		})
	}

	addFloor(floorID) {
		const floors = require("../crumbs/floors")

		if (!floors[floorID]) return this.sendError(402)

		const cost = floors[floorID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.updateColumn("floor", floorID, "igloo")
		this.sendXt("ag", -1, floorID, this.coins)
	}

	addStamp(stampID) {
		if (isNaN(stampID)) return

		const stamps = require("../crumbs/stamps")

		if (!stamps[stampID]) return

		if (this.stamps.includes(stampID)) return

		this.database.insertStamp(this.id, stampID).then(() => {
			this.sendXt("aabs", -1, stampID)
			this.stamps.push(stampID)
		})
	}
}

module.exports = ClubPenguin
"use strict"

class ClubPenguin {
	constructor() {
		this.itemCrumbs = require("../crumbs/items")
		this.furnitureCrumbs = require("../crumbs/furniture")
		this.iglooCrumbs = require("../crumbs/igloos")
		this.floorCrumbs = require("../crumbs/floors")
		this.stampCrumbs = require("../crumbs/stamps")
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

		if (!this.itemCrumbs[itemID]) return this.sendError(402)

		const cost = this.itemCrumbs[itemID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.inventory.push(itemID)
		this.database.insertItem(this.id, itemID)
		this.sendXt("ai", -1, itemID, this.coins)
	}

	addFurniture(furnitureID) {
		if (!this.furnitureCrumbs[furnitureID]) return this.sendError(402)

		const cost = this.furnitureCrumbs[furnitureID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.getColumn("furnitureID", "furniture").then((result) => {
			result.length != 0 ? this.database.updateQuantity(this.id) : this.database.insertFurniture(this.id, furnitureID)

			this.sendXt("af", -1, furnitureID, this.coins)
		})
	}

	addIgloo(iglooID) {
		if (!this.iglooCrumbs[iglooID]) return this.sendError(402)

		const cost = this.iglooCrumbs[iglooID].cost

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
		if (!this.floorCrumbs[floorID]) return this.sendError(402)

		const cost = this.floorCrumbs[floorID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.updateColumn("floor", floorID, "igloo")
		this.sendXt("ag", -1, floorID, this.coins)
	}

	addStamp(stampID) {
		if (isNaN(stampID)) return

		if (!this.stampCrumbs[stampID]) return

		if (this.stamps.includes(stampID)) return

		this.database.insertStamp(this.id, stampID).then(() => {
			this.sendXt("aabs", -1, stampID)
			this.stamps.push(stampID)
		})
	}
}

module.exports = ClubPenguin
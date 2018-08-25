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

		this.server.decodeCrumb("items").then((item_crumbs) => {
			if (!item_crumbs[itemID]) return this.sendError(402)

			const cost = item_crumbs[itemID].cost

			if (this.coins < cost) return this.sendError(401)

			this.removeCoins(cost)
			this.inventory.push(itemID)
			this.database.insertItem(this.id, itemID)
			this.sendXt("ai", -1, itemID, this.coins)
		})
	}

	addFurniture(furnitureID) {
		this.server.decodeCrumb("furniture").then((furniture_crumbs) => {
			if (!furniture_crumbs[furnitureID]) return this.sendError(402)

			const cost = furniture_crumbs[furnitureID].cost

			if (this.coins < cost) return this.sendError(401)

			this.removeCoins(cost)

			this.getColumn("furnitureID", "furniture").then((result) => {
				result.length != 0 ? this.database.updateQuantity(this.id) : this.database.insertFurniture(this.id, furnitureID)

				this.sendXt("af", -1, furnitureID, this.coins)
			})
		})
	}

	addIgloo(iglooID) {
		this.server.decodeCrumb("igloos").then((igloo_crumbs) => {
			if (!igloo_crumbs[iglooID]) return this.sendError(402)

			const cost = igloo_crumbs[iglooID].cost

			if (this.coins < cost) return this.sendError(401)

			this.removeCoins(cost)

			this.getColumn("igloos").then((result) => {
				let igloos = []

				for (const i of result[0].igloos.split("|")) igloos.push(parseInt(i))

				if (igloos.includes(iglooID)) return this.sendError(500)

				this.database.addIgloo(this.id, iglooID)

				if (this.room.id === (this.id + 1000)) this.sendXt("au", -1, iglooID, this.coins)
			})
		})
	}

	addFloor(floorID) {
		this.server.decodeCrumb("floors").then((floor_crumbs) => {
			if (!floor_crumbs[floorID]) return this.sendError(402)

			const cost = floor_crumbs[floorID].cost

			if (this.coins < cost) return this.sendError(401)

			this.removeCoins(cost)
			this.updateColumn("floor", floorID, "igloo")
			this.sendXt("ag", -1, floorID, this.coins)
		})
	}

	addStamp(stampID) {
		this.server.decodeCrumb("stamps").then((stamp_crumbs) => {
			if (isNaN(stampID)) return

			if (!stamp_crumbs[stampID]) return
			if (this.stamps.includes(stampID)) return

			this.database.insertStamp(this.id, stampID).then(() => {
				this.sendXt("aabs", -1, stampID)
				this.stamps.push(stampID)
			})
		})
	}
}

module.exports = ClubPenguin
"use strict"

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
		if (this.inventory.includes(itemID)) return this.sendError(400)
		if (!this.server.item_crumbs[itemID]) return this.sendError(402)

		const cost = this.server.item_crumbs[itemID].cost

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
		if (!this.server.furniture_crumbs[furnitureID]) return this.sendError(402)

		const cost = this.server.furniture_crumbs[furnitureID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)

		this.getColumn("furnitureID", "furniture").then((result) => {
			if (result.length !== 0) {
				this.knex("furniture").increment("quantity", 1).where({
					ID: this.id,
					furnitureID
				})
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
		if (!this.server.igloo_crumbs[iglooID]) return this.sendError(402)

		const cost = this.server.igloo_crumbs[iglooID].cost
		if (this.coins < cost) return this.sendError(401)
		this.removeCoins(cost)

		this.getColumn("igloos").then((result) => {
			let igloos = []
			let iglooStr = ""

			for (const i of result[0].igloos.split("|")) igloos.push(parseInt(i))

			if (igloos.length !== 0) {
				if (igloos.includes(iglooID)) {
					return this.sendError(500)
				}

				igloos.forEach(igloo => {
					iglooStr += `${igloo}|`
				})

				iglooStr += iglooID
			}

			this.updateColumn("igloos", igloos.length === 0 ? iglooID : iglooStr)

			if (this.room.id === (this.id + 1000)) this.sendXt("au", -1, iglooID, this.coins)
		})
	}

	addFloor(floorID) {
		if (!this.server.floor_crumbs[floorID]) return this.sendError(402)

		const cost = this.server.floor_crumbs[floorID].cost

		if (this.coins < cost) return this.sendError(401)

		this.removeCoins(cost)
		this.updateColumn("floor", floorID, "igloo")
		this.sendXt("ag", -1, floorID, this.coins)
	}

	addStamp(stampID) {
		if (isNaN(stampID)) return
		if (!this.server.stamp_crumbs[stampID]) return
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
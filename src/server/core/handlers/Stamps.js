"use strict"

const sp = require("../utils/sp")

class Stamps {
	static handleGetStamps(data, penguin, fromJS = false) {
		const penguinID = fromJS ? penguin.id : parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			let stampStr = ""

			penguin.database.getColumn(penguinID, "stampID", "stamps").then((result) => {
				if (result.length <= 0) return penguin.sendXt("gps", -1, penguinID, "")

				result.forEach(row => {
					penguin.stamps.push(row.stampID)
					stampStr += `${row.stampID}|`
				})

				penguin.sendXt("gps", -1, penguinID, `${stampStr.slice(0, -1)}`)
			}).catch((err) => {
				console.error(err)
			})
		})
	}

	static handleQueryPlayerPins(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			let pinStr = ""

			let pins, items

			penguin.server.decodeCrumb("pins").then((pin_crumbs) => {
				pins = pin_crumbs

				penguin.server.decodeCrumb("items").then((item_crumbs) => {
					items = item_crumbs

					const playerObj = penguin.server.getPenguinById(penguinID)

					if (playerObj) {
						if (playerObj.inventory.length !== 0) {

							playerObj.inventory.forEach(item => {
								if (items[item].type === "pin") {
									if (pins[item] !== undefined) {
										pinStr += `${item}|${pins[item].unix}|1%`
									} else {
										pinStr += `${item}|${sp.getTime()}|1%`
									}
								}
							})

							if (pinStr.length === 0) return playerObj.sendXt("qpp", -1, "")

							playerObj.sendXt("qpp", -1, `${pinStr.slice(0, -1)}`)
						} else {
							return playerObj.sendXt("qpp", -1, "")
						}
					} else {
						penguin.database.getColumn(penguinID, "itemID", "inventory").then((result) => {
							if (result.length <= 0) return penguin.sendXt("qpp", -1, "")

							result.forEach(row => {
								if (items[row.itemID].type === "pin") {
									if (pins[row.itemID] !== undefined) {
										pinStr += `${row.itemID}|${pins[row.itemID].unix}|1%`
									} else {
										pinStr += `${row.itemID}|${sp.getTime()}|1%`
									}
								}
							})

							if (pinStr.length === 0) return penguin.sendXt("qpp", -1, "")

							penguin.sendXt("qpp", -1, `${pinStr.slice(0, -1)}`)
						}).catch((err) => {
							console.error(err)
						})
					}
				})
			})
		})
	}

	static handleQueryPlayerAwards(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			let awardStr = ""

			let awards

			penguin.server.decodeCrumb("awards").then((award_crumbs) => {
				awards = award_crumbs

				const playerObj = penguin.server.getPenguinById(penguinID)

				if (playerObj) {
					if (playerObj.inventory.length !== 0) {

						playerObj.inventory.forEach(award => {
							if (awards[award]) awardStr += `${award}|${awards[award].unix}|1%`
						})

						if (awardStr.length === 0) return playerObj.sendXt("qpa", -1, "")

						playerObj.sendXt("qpa", -1, `${awardStr.slice(0, -1)}`)
					} else {
						return playerObj.sendXt("qpa", -1, "")
					}
				} else {
					penguin.database.getColumn(penguinID, "itemID", "inventory").then((result) => {
						if (result.length <= 0) return penguin.sendXt("qpa", -1, "")

						result.forEach(row => {
							if (awards[row.itemID]) {
								awardStr += `${row.itemID}|${awards[row.itemID].unix}|1%`
							}
						})

						if (awardStr.length === 0) return penguin.sendXt("qpa", -1, "")

						penguin.sendXt("qpa", -1, `${awardStr.slice(0, -1)}`)
					}).catch((err) => {
						console.error(err)
					})
				}
			})
		})
	}

	static handleGetStampBookCoverDetails(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			penguin.database.getColumn(penguinID, "cover").then((result) => {
				penguin.sendXt("gsbcd", -1, result[0].cover)
			}).catch((err) => {
				console.error(err)
			})
		})
	}

	static handleSetStampBookCoverDetails(data, penguin) {
		const p4 = parseInt(data[4]),
			p5 = parseInt(data[5]),
			p6 = parseInt(data[6]),
			p7 = parseInt(data[7])

		if (isNaN(p4) || isNaN(p5) || isNaN(p6) || isNaN(p7)) return penguin.disconnect()

		let cover = [p4, p5, p6, p7].join("%")
		cover += "%"

		data.forEach(row => {
			if (row.length > 13) {
				const exploitCheck = row.split("|")

				exploitCheck.forEach(attri => {
					if (isNaN(attri)) return penguin.disconnect()
				})

				cover += `%${row}`
			}
		})

		penguin.getColumn("cover").then((result) => {
			if (cover === result[0].cover) return

			penguin.updateColumn("cover", cover)
		}).catch((err) => {
			console.error(err)
		})

		penguin.sendXt("ssbcd", -1)
	}

	static handleGetMyRecentlyEarnedStamps(data, penguin) {
		penguin.sendXt("gmres", -1, "")
	}

	static handleAddStamp(data, penguin) {
		const stampID = parseInt(data[4])

		if (isNaN(stampID)) return penguin.disconnect()

		penguin.addStamp(stampID)
	}
}

module.exports = Stamps
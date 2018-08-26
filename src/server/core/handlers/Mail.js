"use strict"

class Mail {
	static handleStartMail(data, penguin) {
		penguin.knex("mail").where("read", 0).where("recipientID", penguin.id).count("read as CNT").then((result) => {
			const unreadPostcards = Number(result[0].CNT)

			penguin.knex("mail").select("recipientID").where("recipientID", penguin.id).then((result) => {
				const readPostcards = Number(result.length)

				penguin.sendXt("mst", -1, unreadPostcards, readPostcards)
			})
		})
	}

	static handleGetMail(data, penguin) {
		penguin.knex("mail").select("*").where("recipientID", penguin.id).then((result) => {
			const mailArr = []

			result.forEach(row => {
				const mailDetails = [row.senderName, row.senderID, row.type, row.details, row.date, row.ID]

				mailArr.push(mailDetails.join("|"))
			})

			if (mailArr.length <= 0) return penguin.sendXt("mg", -1, "")

			penguin.sendXt("mg", -1, mailArr.reverse().join("%"))
		})
	}

	static handleMailChecked(data, penguin) {
		penguin.knex("mail").update("read", 1).where("recipientID", penguin.id).then(() => {
			penguin.sendXt("mc", -1)
		})
	}

	static handleSendMail(data, penguin) {
		const recipientId = parseInt(data[4])
		const mailType = parseInt(data[5])

		if (isNaN(recipientId) || isNaN(mailType)) return penguin.disconnect()

		penguin.doesIDExist(recipientId).then((exists) => {
			if (!exists) return

			if (penguin.coins < 20) return penguin.sendXt("ms", -1, penguin.coins, 2)

			penguin.knex("mail").select("recipientID").where("recipientID", recipientId).then((result) => {
				const readPostcards = Number(result.length)

				if (readPostcards > 99) return penguin.sendXt("ms", -1, penguin.coins, 0)

				penguin.removeCoins(20)
				penguin.sendXt("ms", -1, penguin.coins, 1)

				const sentDate = require("../utils/sp").getTime()

				penguin.knex("mail").insert({
					recipientID: recipientId,
					senderName: penguin.username,
					senderID: penguin.id,
					details: "",
					date: sentDate,
					type: mailType
				}).then((result) => {
					const playerObj = penguin.server.getPenguinById(recipientId)

					if (playerObj) playerObj.sendXt("mr", -1, penguin.username, penguin.id, mailType, "", sentDate, result)
				})
			})
		})
	}

	static handleDeleteMailItem(data, penguin) {
		const mailID = parseInt(data[4])

		if (isNaN(mailID)) return penguin.disconnect()

		penguin.knex("mail").del().where("ID", mailID).then(() => {
			penguin.sendXt("md", -1, mailID)
		})
	}

	static handleDeleteMailItemFromPlayer(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			penguin.knex("mail").del().where("recipientID", penguin.id).where("senderID", penguinID).then(() => {
				penguin.knex("mail").select("recipientID").where("recipientID", penguin.id).then((result) => {
					penguin.sendXt("mdp", -1, Number(result.length))
				})
			})
		})
	}
}

module.exports = Mail
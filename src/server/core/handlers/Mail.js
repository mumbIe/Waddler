"use strict"

class Mail {
	static handleStartMail(data, penguin) {
		penguin.database.getUnreadPostcardCount(penguin.id).then((result) => {
			const unreadPostcards = Number(result[0].CNT)

			penguin.database.getPostcardCount(penguin.id).then((result) => {
				const readPostcards = Number(result.length)

				penguin.sendXt("mst", -1, unreadPostcards, readPostcards)
			})
		})
	}

	static handleGetMail(data, penguin) {
		penguin.database.getPostcardsById(penguin.id).then((result) => {
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
		penguin.database.mailChecked(penguin.id).then(() => {
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

			penguin.database.getPostcardCount(recipientId).then((result) => {
				const readPostcards = Number(result.length)

				if (readPostcards > 99) return penguin.sendXt("ms", -1, penguin.coins, 0)

				penguin.removeCoins(20)
				penguin.sendXt("ms", -1, penguin.coins, 1)

				const sentDate = require("../utils/sp").getTime()

				penguin.database.insertMail(recipientId, penguin.username, penguin.id, "", sentDate, mailType).then((result) => {
					const playerObj = penguin.server.getPenguinById(recipientId)

					if (playerObj) {
						playerObj.sendXt("mr", -1, penguin.username, penguin.id, mailType, "", sentDate, result)
					}
				})
			})
		})
	}

	static handleDeleteMailItem(data, penguin) {
		const mailID = parseInt(data[4])

		if (isNaN(mailID)) return penguin.disconnect()

		penguin.database.deleteMail(mailID).then(() => {
			penguin.sendXt("md", -1, mailID)
		})
	}

	static handleDeleteMailItemFromPlayer(data, penguin) {
		const penguinID = parseInt(data[4])

		if (isNaN(penguinID)) return penguin.disconnect()

		penguin.doesIDExist(penguinID).then((exists) => {
			if (!exists) return

			penguin.database.deleteMailFromPlayer(penguin.id, penguinID).then(() => {
				penguin.database.getPostcardCount(penguin.id).then((result) => {
					penguin.sendXt("mdp", -1, Number(result.length))
				})
			})
		})
	}
}

module.exports = Mail
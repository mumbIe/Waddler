"use strict"

const RND = require("./RND")

class GameDataEncryptor {
	static hashPassword(pass) {
		return require("keccak")("keccak256").update(pass).digest("hex")
	}

	static generateRandomKey(len) {
		return require("crypto").randomBytes(len / 2).toString("hex")
	}

	static decryptZaseth(str, key) {
		let keyIndex = 0x00,
			res = ""
		for (let i = 0x00; i < str.length; i++) {
			let charCode = str.charCodeAt(i),
				firstChar = str.charCodeAt(i + 0x01),
				secondChar = key.charCodeAt(keyIndex)
			charCode &= 0x1F, firstChar &= 0x1F, firstChar *= 0x10
			res += String.fromCharCode((firstChar | charCode) ^ secondChar)
			keyIndex++
			if (keyIndex >= key.length) keyIndex = 0x00
			i++
		}
		return res
	}

	static encryptZasethV2(str, key) {
		let keyIndex = 0x00,
			keyResult = "",
			res = ""
		for (let i = 0x00; i < str.length; i++) {
			let charCode = key.charCodeAt(keyIndex)
			RND.setSeed(charCode * 0x3E8)
			keyResult += String.fromCharCode(charCode ^ RND.Random(0x7F))
			keyIndex++
			if (keyIndex >= key.length) keyIndex = 0x00
		}
		for (let i = 0x00; i < str.length; i++) {
			let firstChar = str.charCodeAt(i),
				charCode = keyResult.charCodeAt(i)
			let secondChar = firstChar ^ charCode,
				thirdChar = (firstChar ^ charCode) & 0xF,
				fourthChar = secondChar & 0xF0
			fourthChar = parseInt((secondChar & 0xF0) / 0x10)
			thirdChar |= 0x40, fourthChar |= 0x40
			res += String.fromCharCode(thirdChar), res += String.fromCharCode(fourthChar)
		}
		return [RND.getSeed(), res]
	}
}

module.exports = GameDataEncryptor
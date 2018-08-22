"use strict"

let rndSeed = 327680

module.exports = {
	Random: function(val) {
		rndSeed = (rndSeed * 1140671485 + 1280163) % 16777216
		return Math.ceil((rndSeed / 16777216) * val)
	},
	setSeed: function(seed) {
		rndSeed = Math.abs(seed)
	},
	getSeed: function() {
		return rndSeed
	}
}
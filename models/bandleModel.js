const bandleSchema = require("../schemas/bandleSchema");

const { model } = require("mongoose");

const Bandle = model("Bandle", bandleSchema);

module.exports = Bandle;

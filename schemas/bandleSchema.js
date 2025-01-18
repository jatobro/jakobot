const { Schema } = require("mongoose");

const bandleSchema = new Schema({
  username: String,
  participations: Number,
  averageScore: Number,
  wins: Number,
  hasParticipated: Boolean,
  isWinning: Boolean,
  todaysScore: Number,
});

module.exports = bandleSchema;

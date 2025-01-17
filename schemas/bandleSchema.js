const { Schema } = require("mongoose");

const bandleSchema = new Schema({
  username: String,
  participations: Number,
  averageScore: Number,
  wins: Number,
  hasParticipated: Boolean,
});

module.exports = bandleSchema;

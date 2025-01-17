const Bandle = require("../models/bandleModel");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bandlestats")
    .setDescription("posts the current bandle stats"),
  execute: async (interaction) => {
    Bandle.find({})
      .sort([["wins", "descending"]])
      .exec((err, res) => {
        if (res) {
          const result = res.map((bandle) => {
            return `${bandle.username}: ${bandle.participations} participations, ${bandle.averageScore} avg score, ${bandle.wins} wins`;
          });

          interaction.reply(result.join("\n"));
        }
      });
  },
};

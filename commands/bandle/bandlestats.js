const Bandle = require("../../models/bandleModel");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bandlestats")
    .setDescription("posts the current bandle stats"),
  async execute(interaction) {
    console.log("bandlestats executed");

    let replyString = null;
    const bandles = (await Bandle.find({}).sort([["wins", "descending"]])).map(
      (bandle) =>
        `${bandle.username}: ${bandle.participations} participations, ${bandle.averageScore} avg score, ${bandle.wins} wins`
    );

    replyString = bandles.join("\n");

    if (replyString) {
      await interaction.reply(replyString);
    }
  },
};

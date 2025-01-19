const Bandle = require("../../models/bandleModel");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bandlewinner")
    .setDescription("posts the current bandle winner of today"),
  async execute(interaction) {
    console.log("bandlewinner executed");

    const winner = await Bandle.findOne({ isWinning: true });

    await interaction.reply(
      `**${winner.username} is currently winning todays bandle**`
    );
  },
};

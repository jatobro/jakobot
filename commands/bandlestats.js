const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bandlestats")
    .setDescription("posts the current bandle stats"),
  execute: async (interaction) => {
    interaction.reply("stats");
  },
};

const Bandle = require("../../models/bandleModel");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bandlestats")
    .setDescription("posts the current bandle stats"),
  async execute(interaction) {
    console.log("bandlestats executed");

    const bandles = await Bandle.find({}).sort([["wins", "descending"]]);

    if (bandles.length == 0) {
      interaction.reply("**no data avaliable**");
    }

    let table = "| User | Wins | Participations | Average Score |\n\n";

    bandles.forEach((bandle) => {
      const { username, wins, participations, averageScore } = bandle; // Adjust fields based on your schema
      table += `| ${username} | ${String(wins)} | ${String(
        participations
      )} | ${averageScore.toFixed(2)} |\n`;
    });

    await interaction.reply(`**Bandle Statistics**\n\`\`\`${table}\`\`\``);
  },
};

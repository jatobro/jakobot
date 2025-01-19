const mongoose = require("mongoose");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { Cron } = require("croner");
require("dotenv").config();

const dbConnect = require("./utils/db-connect");
const loadCommandFiles = require("./utils/load-command-files");

const Bandle = require("./models/bandleModel");

dbConnect();

mongoose.connection.once("open", () => {
  console.log("connected to db");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
    ],
  });

  loadCommandFiles(client);

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`ready! logged in as ${readyClient.user.tag}`);

    try {
      const channel = await client.channels.fetch(process.env.BOT_ID);
      channel.send("yoyoyo im backk boiiis");
    } catch (err) {
      console.error(err);
    }

    // run every midnight
    // eslint-disable-next-line no-unused-vars
    const cron = new Cron("0 0 0 * * *", async () => {
      Bandle.updateMany({}, { hasParticipated: false }).then(() =>
        console.log("bandle participation status reset")
      );

      const winner = await Bandle.findOneAndUpdate(
        { isWinning: true },
        { $inc: { wins: 1 } }
      );

      const channel = await client.channels.fetch(process.env.BANDLE_ID);

      if (!winner) {
        await channel.send("no participants for todays bandle...");
      } else {
        await channel.send(
          `congratulations to ${winner.username}, they now have ${
            winner.wins + 1
          } wins`
        );

        await Bandle.updateOne(
          { username: winner.username },
          { isWinning: false }
        );
      }
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`no command matching ${interaction.commandName} was found`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "there was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "there was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.username === "mysticflamexd") {
      message.react("😂");
    }

    if (message.author.bot) return;

    if (
      message.channelId != process.env.BANDLE_ID ||
      !/^Bandle #\d+ [1-6]\/6/.test(message.content)
    )
      return;

    console.log("bandle score posting detected");

    try {
      const score = parseInt(message.content.split(" ")[2].split("/")[0]);

      const bandle = await Bandle.findOne({
        username: message.author.username,
      });

      const currentWinner = await Bandle.findOne({ isWinning: true });

      const isNewWinner = currentWinner
        ? score >= currentWinner.todaysScore
          ? false
          : true
        : true;

      if (!bandle) {
        const newBandle = new Bandle({
          username: message.author.username,
          participations: 1,
          averageScore: score,
          wins: 0,
          hasParticipated: true,
          isWinning: isNewWinner,
          todaysScore: score,
        });

        newBandle.save().then(() => console.log("new bandle user created"));
      } else {
        if (bandle.hasParticipated) {
          message.reply(
            `you have already participated in the daily bandle challenge`
          );
          return;
        }

        const newParticipations = bandle.participations + 1;
        const newAverageScore =
          (bandle.averageScore * bandle.participations + score) /
          newParticipations;

        const updates = {
          participations: newParticipations,
          averageScore: newAverageScore,
          hasParticipated: true,
          isWinning: isNewWinner,
          todaysScore: score,
        };

        Bandle.updateOne({ username: message.author.username }, updates).then(
          () => console.log("existing bandle user updated")
        );
      }
    } catch (err) {
      console.error(err);
    }

    message.reply(
      `daily bandle score for ${message.author.displayName} registered`
    );
  });

  client.login(process.env.TOKEN);
});

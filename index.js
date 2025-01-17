const dbConnect = require("./db");
const Bandle = require("./models/bandleModel");

const mongoose = require("mongoose");
const { Client, Events, GatewayIntentBits } = require("discord.js");

dbConnect();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`ready! logged in as ${readyClient.user.tag}`);
});

mongoose.connection.once("open", () => {
  console.log("connected to db");

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.channelId != Bun.env.BANDLE_ID) return;

    console.log(`message sent to bandle channel by ${message.author.username}`);

    if (!/^Bandle #\d+ [1-6]\/6/.test(message.content)) return;

    console.log(`bandle score posted by ${message.author.username}`);

    // calculate score
    const score = parseInt(message.content.split(" ")[2].split("/")[0]);
    console.log(`score: ${score}`);

    const bandle = await Bandle.findOne({
      username: message.author.username,
    });

    if (!bandle) {
      const newBandle = new Bandle({
        username: message.author.username,
        participations: 1,
        averageScore: score,
        wins: 0,
        hasParticipated: true,
      });

      newBandle.save().then(() => console.log("new bandle participant"));
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
      };

      Bandle.updateOne({ username: message.author.username }, updates).then(
        () => console.log("existing user bandle participation registered")
      );
    }

    message.reply(
      `daily bandle score for ${message.author.displayName} registered`
    );
  });
});

client.login(Bun.env.TOKEN);

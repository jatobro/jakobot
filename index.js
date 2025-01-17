const dbConnect = require("./db");
const Bandle = require("./models/bandleModel");

const mongoose = require("mongoose");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { Cron } = require("croner");

dbConnect();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

mongoose.connection.once("open", () => {
  console.log("connected to db");

  let currentWinner = null;
  let currentWinnerScore = null;

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`ready! logged in as ${readyClient.user.tag}`);

    // run every midnight
    // eslint-disable-next-line no-unused-vars
    const cron = new Cron("0 0 0 * * *", () => {
      console.log("new day, resetting bandle participation status");

      Bandle.updateMany({}, { hasParticipated: false }).then(() =>
        console.log("bandle participation status reset")
      );

      const winner = Bandle.findOne({ username: currentWinner })
        .then(() => console.log("winner found"))
        .catch((err) => console.log(err));
      Bandle.updateOne(
        { username: currentWinner },
        { wins: winner.wins + 1 }
      ).then(() => console.log("win added to winner"));

      const channel = client.channels.cache.get(Bun.env.BANDLE_ID);
      channel.send(
        `congratulations for winning the daily bandle challenge @${currentWinner}, you now have ${winner.wins} wins!`
      );
    });
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.channelId != Bun.env.BANDLE_ID) return;

    console.log(`message sent to bandle channel by ${message.author.username}`);

    if (!/^Bandle #\d+ [1-6]\/6/.test(message.content)) return;

    console.log(`bandle score posted by ${message.author.username}`);

    // calculate score
    const score = parseInt(message.content.split(" ")[2].split("/")[0]);
    console.log(`score: ${score}`);

    if (!currentWinnerScore || score > currentWinnerScore) {
      currentWinner = message.author.username;
      currentWinnerScore = score;
    }

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

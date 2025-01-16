const { Client, Events, GatewayIntentBits } = require("discord.js");

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

client.login(Bun.env.TOKEN);

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.channelId != Bun.env.BANDLE_ID) return;

  console.log(
    `message sent to bandle channel with content:\n${message.content}`
  );

  const bandleRegex = /^Bandle #\d+ [1-6]\/6/;

  console.log(bandleRegex.test(message.content));

  if (!bandleRegex.test(message.content)) return;

  message
    .react("bandle score posted")
    .then(() =>
      console.log(`Reacted to a Bandle message from ${message.author.tag}`)
    )
    .catch(console.error);
});

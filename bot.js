const { Client, GatewayIntentBits } = require("discord.js");
const WebSocket = require("ws");

const TOKEN = "YOUR_DISCORD_BOT_TOKEN";
const CHANNEL_ID = "YOUR_CHANNEL_ID";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const wss = new WebSocket.Server({ port: 3000 });

let sockets = [];

wss.on("connection", (ws) => {
  sockets.push(ws);

  ws.on("message", (msg) => {
    let data = JSON.parse(msg);

    // Send to Discord
    let channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
      channel.send(`💬 **${data.user}:** ${data.text}`);
    }
  });

  ws.on("close", () => {
    sockets = sockets.filter(s => s !== ws);
  });
});

// Discord → Website
client.on("messageCreate", (msg) => {
  if (msg.channel.id !== CHANNEL_ID) return;
  if (msg.author.bot) return;

  let data = JSON.stringify({
    user: msg.author.username,
    text: msg.content
  });

  sockets.forEach(s => s.send(data));
});

client.login(TOKEN);
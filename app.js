const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. 這一段是用來應付 Render 檢查的 Web 伺服器，防止它因為偵測不到埠口而關機
const app = express();
app.get('/', (req, res) => res.send('Butterfly Bot is Running!'));
app.listen(process.env.PORT || 10000);

// 2. 真正的 Discord 機械人設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🎉 機械人成功上線！已登入為: ${client.user.tag}`);
});

// 讀取你之前在 Render 設定好的環境變數 DISCORD_TOKEN
client.login(process.env.DISCORD_TOKEN);

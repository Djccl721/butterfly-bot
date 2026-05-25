const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. 防 Render 斷線的網頁伺服器
const app = express();
app.get('/', (req, res) => res.send('Butterfly Bot is Live with DeepSeek AI!'));
app.listen(process.env.PORT || 10000);

// 2. Discord 機械人設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🎉 DeepSeek AI 機械人成功上線！已登入為: ${client.user.tag}`);
});

// 3. 核心：聽訊息並用 DeepSeek AI 對答
client.on('messageCreate', async (message) => {
    // 🛡️ 防洗版安全線
    if (!message.author || message.author.bot || message.author.id === client.user.id) return;

    try {
        await message.channel.sendTyping();

        // 呼叫 DeepSeek API（香港直連，超高併發無上限）
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`, // 讀取 Render 的 DEEPSEEK_KEY
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek-chat", // DeepSeek V3 旗艦模型，廣東話超地道
                "messages": [
                    // 🎭 在這裡可以隨時修改你想灌輸給蝶兄的性格或背景設定
                    { "role": "system", "content": "你是一個活潑、友善的 Discord 機械人，名叫蝶兄，請用繁體中文（帶有一點香港廣東話口語）親切地回覆用家。" },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply && aiReply.trim() !== "") {
            await message.reply(aiReply);
        }
    } catch (error) {
        console.error("❌ DeepSeek 連線出錯啦:", error);
    }
});

client.login(process.env.DISCORD_TOKEN);

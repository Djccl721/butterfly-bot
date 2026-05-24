const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. 防 Render 斷線的網頁伺服器
const app = express();
app.get('/', (req, res) => res.send('Butterfly Bot is Live with Mistral AI!'));
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
    console.log(`🎉 Mistral AI 機械人成功上線！已登入為: ${client.user.tag}`);
});

// 3. 核心：聽訊息並用 Mistral AI 對答
client.on('messageCreate', async (message) => {
    // 🛡️ 防洗版三道鎖
    if (!message.author || message.author.bot || message.author.id === client.user.id) return;

    try {
        await message.channel.sendTyping();

        // 呼叫 Mistral AI API（香港直連免 VPN，每月百萬次額度）
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.MISTRAL_KEY}`, // 讀取 Render 的 MISTRAL_KEY
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "mistral-small-latest", // Mistral 速度極快、中文極佳的免費模型
                "messages": [
                    { "role": "system", "content": "你是一個活潑、友善的 Discord 機械人，名叫蝶兄，請用繁體中文（帶有一點香港廣東話口語）親切地回覆用家。" },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        
        // 提取 Mistral 回覆文字
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply && aiReply.trim() !== "") {
            await message.reply(aiReply);
        }
    } catch (error) {
        console.error("Mistral 對答出錯啦:", error);
    }
});

client.login(process.env.DISCORD_TOKEN);

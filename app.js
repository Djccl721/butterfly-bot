const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. 防 Render 斷線的網頁伺服器
const app = express();
app.get('/', (req, res) => res.send('Butterfly Bot is Live with AI!'));
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
    console.log(`🎉 AI 機械人成功上線！已登入為: ${client.user.tag}`);
});

// 3. 核心：聽訊息並用 OpenRouter AI 對答
client.on('messageCreate', async (message) => {
    // 如果訊息係機械人自己發出嘅，就唔理佢，免得無限洗版
    if (message.author.bot) return;

    // 接收到用家訊息，準備傳畀 AI
    try {
        // 顯示「輸入中...」等機械人望落有反應
        await message.channel.sendTyping();

        // 動態載入 fetch (應對新版 Node.js)
        const { default: fetch } = await import('node-fetch');

        // 呼叫 OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`, // 讀取你 Render 的 OpenRouter Key
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3-8b-instruct:free", // 免費版 AI 模型，你可以隨時改
                "messages": [
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        
        // 提取 AI 回覆嘅文字
        const aiReply = data.choices?.[0]?.message?.content || "抱歉，我思考咗一下但唔知點覆你 QQ";

        // 在 Discord 回覆用家
        await message.reply(aiReply);

    } catch (error) {
        console.error("AI 對答出錯啦:", error);
        await message.reply("砂鍋大的錯誤！我個大腦短路咗，請稍後再試。");
    }
});

// 登入機械人
client.login(process.env.DISCORD_TOKEN);

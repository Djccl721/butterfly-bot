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

    // 🔍 診斷 1：睇吓機械人到底聽唔聽到你講嘢
    console.log(`📥 收到來自 ${message.author.tag} 嘅訊息: "${message.content}"`);

    try {
        await message.channel.sendTyping();

        // 呼叫 Mistral AI API
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.MISTRAL_KEY}`, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "mistral-small-latest", 
                "messages": [
                    { "role": "system", "content": "你是一個活潑、友善的 Discord 機械人，名叫蝶兄，請用繁體中文（帶有一點香港廣東話口語）親切地回覆用家。" },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        
        // 🔍 診斷 2：睇吓 Mistral 到底回傳咗咩 API 內容
        console.log("📡 Mistral API 原始回傳數據:", JSON.stringify(data));
        
        // 提取 Mistral 回覆文字
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply && aiReply.trim() !== "") {
            console.log(`📤 準備發送回覆: "${aiReply}"`);
            await message.reply(aiReply);
        } else {
            console.log("⚠️ AI 沒有回傳有效文字，或者格式不符。");
        }
    } catch (error) {
        // 🔍 診斷 3：捕捉任何連線或 Discord 發言權限錯誤
        console.error("❌ Mistral 運作期間撞車，報錯原因:", error);
    }
});

client.login(process.env.DISCORD_TOKEN);

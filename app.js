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
    
    // 🛡️ 終極防洗版三道鎖 🛡️
    if (!message.author) return; 
    if (message.author.bot) return; // 鎖1：如果是傳統機械人，跳過
    if (message.author.id === client.user.id) return; // 鎖2：如果訊息發送者的 ID 跟我（機械人）一模一樣，絕對跳過！

    // 接收到用家訊息，準備傳畀 AI
    try {
        // 顯示「輸入中...」
        await message.channel.sendTyping();

        // 呼叫 OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash", // 換上更穩定的免費 Gemini 模型
                "messages": [
                    { "role": "system", "content": "你是一個活潑、友善的 Discord 機械人，名叫蝶兄，請用繁體中文（帶有一點香港廣東話口語）親切地回覆用家。" },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        
        // 提取 AI 回覆嘅文字
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply && aiReply.trim() !== "") {
            // 只有當 AI 真的有回覆正常內容時，才發送訊息
            await message.reply(aiReply);
        } else {
            console.log("OpenRouter 回傳了空內容：", data);
            // 唔好再覆「抱歉 QQ」，免得格式出錯時引發誤判，直接在後台 log 就好
        }

    } catch (error) {
        console.error("AI 對答出錯啦:", error);
    }
});

// 登入機械人
client.login(process.env.DISCORD_TOKEN);

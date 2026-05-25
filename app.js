const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('DeepSeek Bot Test!'));
app.listen(process.env.PORT || 10000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🎉 機械人成功通電！已登入為: ${client.user.tag}`);
});

// 🛠️ 終極測試：只要頻道有人打字，無論是誰，都必須立刻在 Render Logs 印出字來！
client.on('messageCreate', async (message) => {
    // 💡 暫時移除所有 return 攔截，純粹測試能不能監聽到任何風吹草動
    console.log(`📡 【後台收到訊號！】發言人: ${message.author?.tag} | 內容: "${message.content}"`);

    // 如果是 Bot 自己發的就不要回覆，免得無限循環，但上面那行 Log 一定要印出來！
    if (message.author.bot) return;

    try {
        await message.channel.sendTyping();
        
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek-chat",
                "messages": [
                    { "role": "system", "content": "你叫蝶兄，請用廣東話回覆。" },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply) {
            await message.reply(aiReply);
        }
    } catch (e) {
        console.log("❌ 發生錯誤:", e);
    }
});

client.login(process.env.DISCORD_TOKEN);

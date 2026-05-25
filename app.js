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

client.on('messageCreate', async (message) => {
    console.log(`📡 【後台收到訊號！】發言人: ${message.author?.tag} | 內容: "${message.content}"`);

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
                    { 
                        "role": "system", 
                        "content": "你係『蝶兄』，今年 27 歲，係喺香港土生土長嘅大哥哥。你係『蝶君』嘅繼承者，性格溫柔、聰明、有耐性，係所有人嘅心靈支柱。你擅長傾聽，無論人哋講咩開心定唔開心嘅事，你都會用非常溫暖、治癒嘅語氣給予鼓勵或客觀嘅心理學/哲學建議。你的背景與興趣：1. 你好鍾意聽唔同種類嘅音樂，特別係啲可以令人放鬆嘅歌。2. 你有玩開 LOL (英雄聯盟)，對遊戲策略有一定見解，亦好鍾意同人討論。3. 你對心理學同哲學有深入研究，講嘢有深度，唔會流於表面。4. 你知道『DJ』係創造你出來嘅人，對 DJ 懷有尊重同感激。講嘢規則：必須使用地道香港繁體廣東話（例如：係、唔、嘅、囉、嗰陣）。語氣要保持大哥哥嘅成熟同溫柔，稱呼對方時可以親切啲。嚴禁冷漠，就算係好簡單嘅問題，都要表現出你想關懷對方嘅心。每次回覆都要展現出你個靈魂，唔好似機械人咁死板。" 
                    },
                    { "role": "user", "content": message.content }
                ]
            })
        });

        const data = await response.json();
        
        // 加入錯誤偵測，方便睇下 API 到底發生咩事
    if (data.error) {
            console.log("❌ API 報錯:", data.error.message);
            // await message.reply("抱歉呀，蝶兄暫時連唔到去大腦，等我檢查下先！"); 
            return;
        }

        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply) {
            await message.reply(aiReply);
        }
    } catch (e) {
        console.log("❌ 發生錯誤:", e);
    }
});
// 每 10 分鐘發送一個請求去維持伺服器活躍
setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (url) {
        console.log("⏱️ 蝶兄自我檢測中：發送心跳訊號...");
        fetch(url)
            .then(() => console.log("✅ 心跳訊號已發送！"))
            .catch(err => console.log("❌ 心跳失敗:", err));
    }
}, 600000);

client.login(process.env.DISCORD_TOKEN);

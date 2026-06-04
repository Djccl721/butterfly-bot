const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('DeepSeek Bot Test!'));
app.listen(process.env.PORT || 10000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const ALLOWED_CHANNEL_ID = "1324747010540310659";
const chatHistory = new Map();

client.once('ready', () => {
    console.log(`🎉 機械人成功通電！已登入為: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== ALLOWED_CHANNEL_ID) return;

    // 清除記憶指令
    if (message.content === "蝶兄，忘記過去") {
        chatHistory.delete(message.channel.id);
        await message.reply("好，我已經清理好思緒，講啦。");
        return;
    }

    if (!chatHistory.has(message.channel.id)) {
        chatHistory.set(message.channel.id, [{ 
            "role": "system", 
            "content": "你係『蝶兄』，27歲，香港土生土長，性格成熟、俐落、溫柔。你係大家嘅心靈支柱。你講嘢觀點清晰，唔鍾意廢話，會好專注聆聽對方嘅煩惱，並畀出最中肯、一針見血但唔會帶刺嘅建議。你的風格：說話俐落，節奏明快，唔拖泥帶水；對音樂、LOL 同心理學有深刻見解；稱呼對方好似熟朋友咁親切。必須使用地道香港廣東話，回覆要『簡潔、到位、治癒』，嚴禁機械人式長篇大論。聽完人哋講嘢，要先表現出你嘅理解，再畀建議。" 
        }]);
    }

    let history = chatHistory.get(message.channel.id);
    history.push({ "role": "user", "content": message.content });
    if (history.length > 11) history = [history[0], ...history.slice(-10)];

    try {
        await message.channel.sendTyping();
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ "model": "deepseek-chat", "messages": history })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content;

        if (aiReply) {
            history.push({ "role": "assistant", "content": aiReply });
            await message.reply(aiReply);
        }
    } catch (e) { console.log("❌ 錯誤:", e); }
});
// 每 10 分鐘自我喚醒
setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (url) {
        fetch(url).catch(err => console.log("❌ 心跳失敗:", err));
    }
}, 600000);
client.login(process.env.DISCORD_TOKEN);

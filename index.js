const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const axios = require('axios');
const BOT_TOKEN = '7898284099:AAEK_MkRO_bpTkLtxc5gTBJQlxGbvtTdqa4'; // Ganti token di sini
const OWNER_ID = 5597928289;

const bot = new Telegraf(BOT_TOKEN);

let users = [];
const usersFile = './users.json';

if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function isOwner(id) {
  return id === OWNER_ID;
}

function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Auto save user
bot.use((ctx, next) => {
  const userId = ctx.from.id;
  if (!users.find(u => u.id === userId)) {
    users.push({ id: userId, name: ctx.from.first_name, username: ctx.from.username || '-', joined: new Date().toISOString() });
    saveUsers();
  }
  return next();
});

// Start menu
bot.start((ctx) => {
  
  const name = ctx.from.first_name;
  const photoUrl = 'https://files.catbox.moe/y5pf2s.png';
  const caption = `
\`\`\`
Selamat Datang👋
Ini Adalah Bot Untuk Cek Username Bot / Id Bot Pakai Token Bot
Ingin Beli Script No Enc? Chat Donz Aja Ketik /dev

╭─⏤͟͟͞͞𝙄𝙣𝙛𝙤𝙧𝙢𝙖𝙨𝙞 𝘽𝙤𝙩 ͟͟͞͞⏤࿐
│☭ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: Cek Bot Token
│☭ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 1.0
│☭ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @DonzTzy¹
╰────────────────

╭─⏤͟͟͞͞𝙁𝙞𝙩𝙪𝙧 𝙁𝙞𝙩𝙪𝙧 𝘽𝙤𝙩 ͟͟͞͞⏤࿐
│☭ /cekbot <Token>
│☭ /cekuser <id tele>
│☭ /cekpp <id tele>
╰────────────────

╭─⏤͟͟͞͞𝙊𝙬𝙣𝙚𝙧 𝙁𝙞𝙩𝙪𝙧 ͟͟͞͞⏤࿐
│☭ /dev
│☭ /broadcast
╰────────────────
\`\`\`
`; return ctx.replyWithPhoto(
    { url: photoUrl },
    {
      caption,
      parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
        [Markup.button.callback('BUY SCRIPT', 'sc'), Markup.button.callback('DEVELOPER', 'dev')],
      ]),
    }
  );
});

bot.action('sc', (ctx) => {
  return ctx.reply('𝐌𝐚𝐮 𝐁𝐮𝐲 𝐒𝐜 𝐍𝐨 𝐄𝐧𝐜?? 𝐂𝐡𝐚𝐭 𝐀𝐣𝐚 𝐃𝐨𝐧𝐳\n𝐇𝐚𝐫𝐠𝐚 𝐌𝐮𝐫𝐦𝐞𝐫 𝐊𝐨', Markup.inlineKeyboard([
    Markup.button.url('BUY SCRIPT', 'https://t.me/DonzTzy')
  ]));
});

bot.action('dev', (ctx) => {
  return ctx.reply('𝐇𝐚𝐥𝐨 𝐊𝐚𝐤 𝐈𝐧𝐢 𝐂𝐥𝐢𝐜𝐤 𝐁𝐮𝐭𝐭𝐨𝐧 𝐃𝐢 𝐁𝐚𝐰𝐚𝐡', Markup.inlineKeyboard([
    Markup.button.url('Donz Tzy', 'https://t.me/DonzTzy')
  ]));
});

bot.on('message', (ctx, next) => {
  const { id, first_name, username } = ctx.from;
  const msg = ctx.message.text || '[non-text message]';
  console.log(`[LOG] ${first_name} (${username || '-'}) [${id}]: ${msg}\n\n`);
  return next();
});

bot.command('broadcast', async (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply('Khusus owner!');

  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) return ctx.reply('Contoh: /broadcast Pesan ke semua user');

  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.id, `
📢 𝐖𝐎𝐈 𝐏𝐀𝐑𝐀 𝐔𝐒𝐄𝐑 𝐀𝐃𝐀 𝐏𝐄𝐒𝐀𝐍 𝐃𝐀𝐑𝐎 𝐃𝐄𝐕 𝐃𝐎𝐍𝐙 
${text}`);
      success++;
    } catch {
      failed++;
    }
  }

  ctx.reply(`Broadcast selesai!\nBerhasil: ${success}\nGagal: ${failed}`);
});

// Commands
bot.command('cekid', (ctx) => ctx.reply(`ID kamu: \`${ctx.from.id}\``));

bot.command('cekpp', async (ctx) => {
  const args = ctx.message.text.split(' ')[1];
  if (!args) return ctx.reply('Contoh: /cekpp 123456789');
  try {
    const photos = await bot.telegram.getUserProfilePhotos(args);
    if (photos.total_count === 0) return ctx.reply('Pengguna tidak memiliki foto profil.');
    const file_id = photos.photos[0][0].file_id;
    await ctx.replyWithPhoto(file_id, { caption: `Done Cuy ✅ Nih Pp User ${args}` });
  } catch (e) {
    ctx.reply('Gagal mengambil foto profil. Pastikan ID valid.');
  }
});

bot.command('cekuser', async (ctx) => {
  const args = ctx.message.text.split(' ')[1];
  if (!args || isNaN(args)) return ctx.reply('Gunakan format:\n/cekuser <id_telegram>');

  try {
    const userInfo = await ctx.telegram.getChat(args);
    const nama = userInfo.first_name || '-';
    const username = userInfo.username ? `@${userInfo.username}` : '-';

    ctx.reply(
      `𝐈𝐍𝐅𝐎 𝐔𝐒𝐄𝐑\n` +
      `𝐍𝐚𝐦𝐚: ${escapeMarkdownV2(nama)}\n` +
      `𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${escapeMarkdownV2(username)}\n` +
      `𝐈𝐃: \`${args}\``,
      { parse_mode: 'MarkdownV2' }
    );
  } catch (err) {
    ctx.reply('User tidak ditemukan atau tidak dapat diakses.');
  }
});

bot.command('cekbot', async (ctx) => {
  const args = ctx.message.text.split(' ')[1];
  if (!args || !args.includes(':')) {
    return ctx.reply('Format salah! Contoh: /cekbot <token_bot>');
  }

  const token = args.trim();
  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    const data = response.data;
    if (!data.ok || !data.result) {
      return ctx.reply('Gagal mendapatkan info bot. Token mungkin tidak valid.');
    }

    const { id, first_name, username } = data.result;
    const replyText = `
𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
𝐍𝐚𝐦𝐞 𝐁𝐨𝐭: ${escapeMarkdownV2(first_name)}
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: @${escapeMarkdownV2(username)}
𝐈𝐃: \`${id}\`

ʙᴏᴛ ʙʏ ᴅᴏɴᴢ ᴛᴢʏ`;
    return ctx.reply(replyText, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    ctx.reply('Token tidak valid atau terjadi kesalahan saat menghubungi server Telegram.');
  }
});

bot.launch().then(() => console.log('Bot siap!'));


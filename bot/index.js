require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

// ── Config ──────────────────────────────────────────────────────────────────────
const DISCORD_TOKEN  = process.env.DISCORD_BOT_TOKEN;
const SHORT_API_BASE = "https://linkurlshort.page.gd";
const PREFIX         = "!";

// ── Cookie challenge solver ──────────────────────────────────────────────────────
// The site protects all requests with a slowAES-based JS cookie challenge.
// We fetch aes.js once, solve it in Node, then attach __test= to every POST.
let _cachedCookie = null;

async function getSolvedCookie(fetch) {
  if (_cachedCookie) return _cachedCookie;

  // 1. GET the homepage to retrieve the challenge values from the HTML
  const homeRes = await fetch(`${SHORT_API_BASE}/`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const homeHtml = await homeRes.text();

  // Extract the three hex strings passed to slowAES.decrypt(c, 2, a, b)
  const aMatch = homeHtml.match(/toNumbers\(['\"]([0-9a-f]{32})['\"]\)/g);
  if (!aMatch || aMatch.length < 3) throw new Error("Cookie challenge values not found");

  const extract = (s) => s.match(/['\"]([0-9a-f]{32})['\"]/)[1];
  const aHex = extract(aMatch[0]);
  const bHex = extract(aMatch[1]);
  const cHex = extract(aMatch[2]);

  // 2. Fetch the aes.js library from the site
  const aesRes  = await fetch(`${SHORT_API_BASE}/aes.js`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const aesCode = await aesRes.text();

  // 3. Run the AES decryption in a Node vm to get the cookie value
  const vm = require("vm");
  const ctx = {};
  vm.runInNewContext(aesCode, ctx);

  function toNumbers(d) {
    const e = [];
    d.replace(/(..)/g, (d) => e.push(parseInt(d, 16)));
    return e;
  }
  function toHex(arr) {
    return arr.map((b) => (b < 16 ? "0" : "") + b.toString(16)).join("");
  }

  const a = toNumbers(aHex);
  const b = toNumbers(bHex);
  const c = toNumbers(cHex);
  const cookieVal = toHex(ctx.slowAES.decrypt(c, 2, a, b));

  _cachedCookie = cookieVal;
  return cookieVal;
}

// ── Discord client ──────────────────────────────────────────────────────────────
// ── Welcomer config ─────────────────────────────────────────────────────────────
const WELCOME_CHANNEL_ID = "1506536157016494140";
const WELCOME_GIF        = "https://image2url.com/r2/default/gifs/1768488617981-bdc4c780-144f-4a40-8906-ddf01eadb705.gif";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  console.log(`[bot] Online as ${client.user.tag}`);
  client.user.setActivity("!hyperlink", { type: ActivityType.Listening });

  // Register /announce slash command globally
  const announceCommand = new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send a custom embed announcement to a channel")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel to send the announcement in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .toJSON();

  try {
    await client.application.commands.set([announceCommand]);
    console.log("[bot] Slash commands registered.");
  } catch (err) {
    console.error("[bot] Failed to register slash commands:", err.message);
  }
});

// ── Welcomer ────────────────────────────────────────────────────────────────────
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const welcomeEmbed = new EmbedBuilder()
    .setDescription(
      "**─── <a:emoji_8:1506236357775720548> `ɪɴꜱᴀɴɪᴛʏ   | ɢᴀᴛᴇᴡᴀʏ` <a:emoji_8:1506236357775720548> ───\n\n" +
      "<a:emoji_3:1500695831169204295> ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴏᴜʀ ꜱᴇʀᴠᴇʀ ᴛʜᴀᴛ ʜᴀꜱ ᴍᴀɴʏ ꜰᴇᴀᴛᴜʀᴇꜱ ᴀɴᴅ ʙᴇꜱᴛ ꜱɪᴛᴇꜱ ᴇxɪꜱᴛ\n\n" +
      "<:emoji_4:1501269124330950787> ʙᴇꜱᴛ ʙᴇᴀᴍ ꜱɪᴛᴇꜱ ᴏꜰ ᴀʟʟ ᴛɪᴍᴇ**"
    )
    .setImage(WELCOME_GIF)
    .setFooter({
      text: `Welcome ${member.user.username}`,
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    });

  await channel.send({
    content: `<@${member.id}>`,
    embeds: [welcomeEmbed],
  });
});

// ── !hyperlink command ──────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild)     return;

  const content = message.content.trim().toLowerCase();
  if (content !== `${PREFIX}hyperlink`) return;

  // Build the embed that prompts the user to submit a link
  const embed = new EmbedBuilder()
    .setDescription(
      "**─── <:emoji_1:1500680900428435646> `ɪɴꜱᴀɴɪᴛʏ   | ʜʏᴘᴇʀʟɪɴᴋ` <:emoji_1:1500680900428435646> ───\n\n" +
      "<a:emoji_3:1500695831169204295> ᴜꜱᴇ ᴛʜɪꜱ ᴛᴏᴏʟ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ʜʏᴘᴇʀʟɪɴᴋꜱ ᴛʜᴀᴛ ʙʏᴘᴀꜱꜱ ᴅɪꜱᴄᴏʀᴅ ᴡᴀʀɴɪɴɢꜱ\n\n" +
      "<:emoji_4:1501269124330950787> ʙᴇꜱᴛ ʜʏᴘᴇʀʟɪɴᴋ ᴏꜰ ᴀʟʟ ᴛɪᴍᴇ**"
    )
    .setImage("https://image2url.com/r2/default/gifs/1768488617981-bdc4c780-144f-4a40-8906-ddf01eadb705.gif")
    .setFooter({
      text: `Requested by ${message.author.username}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("hyperlink_submit")
      .setLabel("ʜʏᴘᴇʀʟɪɴᴋ")
      .setStyle(ButtonStyle.Primary)
      .setEmoji({ id: "1500695831169204295", name: "emoji_3", animated: true })
  );

  await message.reply({ embeds: [embed], components: [row] });
});

// ── Button / Modal interactions ─────────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {

  // ── /announce slash command — open the announce modal ──
  if (interaction.isChatInputCommand() && interaction.commandName === "announce") {
    const targetChannel = interaction.options.getChannel("channel");

    const modal = new ModalBuilder()
      .setCustomId(`announce_modal:${targetChannel.id}`)
      .setTitle("Create Announcement Embed");

    const titleInput = new TextInputBuilder()
      .setCustomId("ann_title")
      .setLabel("Title (optional)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. Server Update")
      .setRequired(false);

    const bodyInput = new TextInputBuilder()
      .setCustomId("ann_body")
      .setLabel("Body / Description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Write your announcement here...")
      .setRequired(true);

    const footerInput = new TextInputBuilder()
      .setCustomId("ann_footer")
      .setLabel("Footer text (optional)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. Insanity Network")
      .setRequired(false);

    const imageInput = new TextInputBuilder()
      .setCustomId("ann_image")
      .setLabel("Image URL (optional, shown as large image)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://example.com/banner.gif")
      .setRequired(false);

    const colorInput = new TextInputBuilder()
      .setCustomId("ann_color")
      .setLabel("Embed color hex (optional, e.g. #5865F2)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("#5865F2")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(bodyInput),
      new ActionRowBuilder().addComponents(footerInput),
      new ActionRowBuilder().addComponents(imageInput),
      new ActionRowBuilder().addComponents(colorInput),
    );

    await interaction.showModal(modal);
    return;
  }

  // ── /announce modal submitted ──
  if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId.startsWith("announce_modal:")
  ) {
    const channelId = interaction.customId.split(":")[1];
    const targetChannel = interaction.guild.channels.cache.get(channelId);

    if (!targetChannel || !targetChannel.isTextBased()) {
      await interaction.reply({ content: "Could not find the target channel.", ephemeral: true });
      return;
    }

    const annTitle  = interaction.fields.getTextInputValue("ann_title").trim();
    const annBody   = interaction.fields.getTextInputValue("ann_body").trim();
    const annFooter = interaction.fields.getTextInputValue("ann_footer").trim();
    const annImage  = interaction.fields.getTextInputValue("ann_image").trim();
    const annColor  = interaction.fields.getTextInputValue("ann_color").trim();

    const embed = new EmbedBuilder().setDescription(annBody);

    if (annTitle)  embed.setTitle(annTitle);
    if (annImage)  embed.setImage(annImage);

    // Parse hex color — fallback to Discord blurple
    if (annColor) {
      const hex = parseInt(annColor.replace("#", ""), 16);
      if (!isNaN(hex)) embed.setColor(hex);
    }

    // Footer: always include requester avatar
    const footerText = annFooter
      ? `${annFooter} • Announced by ${interaction.user.username}`
      : `Announced by ${interaction.user.username}`;

    embed.setFooter({
      text: footerText,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    });

    embed.setTimestamp();

    await targetChannel.send({ embeds: [embed] });

    await interaction.reply({
      content: `Announcement sent to <#${channelId}>.`,
      ephemeral: true,
    });
    return;
  }

  // ── Button pressed: open modal ──
  if (interaction.isButton() && interaction.customId === "hyperlink_submit") {
    const modal = new ModalBuilder()
      .setCustomId("hyperlink_modal")
      .setTitle("Submit a Link to Shorten");

    const urlInput = new TextInputBuilder()
      .setCustomId("url_input")
      .setLabel("Paste your URL here")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://example.com/very/long/url")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(urlInput)
    );

    await interaction.showModal(modal);
    return;
  }

  // ── Modal submitted ──
  if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "hyperlink_modal"
  ) {
    const rawUrl = interaction.fields.getTextInputValue("url_input").trim();

    await interaction.deferReply({ ephemeral: false });

    try {
      const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

      // Step 1 — solve the AES cookie challenge
      const cookie = await getSolvedCookie(fetch);

      // Step 2 — POST the URL as a form with the solved cookie
      const res = await fetch(`${SHORT_API_BASE}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":   "Mozilla/5.0",
          "Cookie":       `__test=${cookie}`,
        },
        body: new URLSearchParams({ url: rawUrl }).toString(),
        redirect: "follow",
      });

      const html = await res.text();

      // Step 3 — extract FMT and SHORT_URL from the JS constants the site embeds
      // e.g. const FMT = "[text](https://linkurlshort.page.gd/index.php?r=XXXXX)";
      const fmtMatch      = html.match(/const FMT\s*=\s*"((?:[^"\\]|\\.)*)"/);
      const shortMatch    = html.match(/const SHORT_URL\s*=\s*"((?:[^"\\]|\\.)*)"/);

      if (!fmtMatch || !shortMatch) {
        await interaction.editReply({
          content: "Could not shorten that link. Make sure the URL starts with `https://` and try again.",
        });
        return;
      }

      // Unescape the JS string (site escapes slashes as \/)
      const fmt      = fmtMatch[1].replace(/\\\//g, "/");
      const shortUrl = shortMatch[1].replace(/\\\//g, "/");

      // Build result embed — no color so there is no left-bar tint
      const resultEmbed = new EmbedBuilder()
        .setDescription(
          `**ʟɪɴᴋ ʜɪᴅᴇ ᴄᴏᴘʏ ᴀɴᴅ ꜱʜᴀʀᴇ**\n\n` +
          `\`${fmt}\`\n\n` +
          `*ᴄᴏᴘʏ ᴛʜ�� ᴛᴇxᴛ ᴀʙᴏᴠᴇ ᴛᴏ ɢᴇᴛ ʏᴏᴜʀ ʜʏᴘᴇʀʟɪɴᴋ*`
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      // Send the fmt as a separate plain message so users can select & copy just the text
      await interaction.editReply({ embeds: [resultEmbed] });
      await interaction.followUp({ content: fmt, ephemeral: false });
    } catch (err) {
      console.error("[bot] hyperlink error:", err.message);
      await interaction.editReply({
        content: "Something went wrong while shortening your link. Please try again.",
      });
    }
  }
});

// ── Start ───────────────────────────────────────────────────────────────────────
if (!DISCORD_TOKEN) {
  console.error("[bot] DISCORD_BOT_TOKEN is not set.");
  process.exit(1);
}

client.login(DISCORD_TOKEN);

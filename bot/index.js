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
} = require("discord.js");

// ── Config ──────────────────────────────────────────────────────────────────────
const DISCORD_TOKEN  = process.env.DISCORD_BOT_TOKEN;
const SHORT_API_BASE = "https://linkurlshort.page.gd";
const PREFIX         = "!";

// ── Discord client ──────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`[bot] Online as ${client.user.tag}`);
  client.user.setActivity("!hyperlink", { type: ActivityType.Listening });
});

// ── !hyperlink command ──────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild)     return;

  const content = message.content.trim().toLowerCase();
  if (content !== `${PREFIX}hyperlink`) return;

  // Build the embed that prompts the user to submit a link
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Hide a Link with Hyperlink")
    .setDescription(
      "Want to disguise a long URL as a clean hyperlink?\n\n" +
      "Click **Submit Link** below, paste your URL, and the bot will return a formatted hyperlink you can share anywhere."
    )
    .addFields(
      { name: "How it works", value: "Your URL is posted to **linkurlshort.page.gd** and returned as a masked hyperlink.", inline: false },
      { name: "Privacy", value: "The link is visible only to you in this message reply.", inline: false }
    )
    .setFooter({ text: "Powered by linkurlshort.page.gd" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("hyperlink_submit")
      .setLabel("Submit Link")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔗")
  );

  await message.reply({ embeds: [embed], components: [row] });
});

// ── Button / Modal interactions ─────────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
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

      // The site is form-based — POST as URL-encoded form data
      const res = await fetch(`${SHORT_API_BASE}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (compatible; HyperlinkBot/1.0)",
        },
        body: new URLSearchParams({ url: rawUrl }).toString(),
      });

      const html = await res.text();

      // Extract the short URL from the returned HTML
      const shortUrlMatch = html.match(/https?:\/\/linkurlshort\.page\.gd\/index\.php\?r=[A-Za-z0-9]+/);
      const shortUrl = shortUrlMatch ? shortUrlMatch[0] : null;

      if (!shortUrl) {
        await interaction.editReply({
          content: "Could not shorten that link. Please check the URL and try again.",
        });
        return;
      }

      // Formatted output exactly as the site shows it
      const formattedOutput = `[${rawUrl}](${shortUrl})`;

      const resultEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Link Shortened")
        .setDescription("Ready to copy and share")
        .addFields(
          { name: "Formatted Output", value: `\`\`\`\n${formattedOutput}\n\`\`\``, inline: false },
          { name: "Short URL", value: shortUrl, inline: false },
          { name: "Original URL", value: rawUrl, inline: false }
        )
        .setFooter({ text: "Powered by linkurlshort.page.gd" })
        .setTimestamp();

      await interaction.editReply({ embeds: [resultEmbed] });
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

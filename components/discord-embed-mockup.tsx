// Real Discord colors
const DC = {
  bg:      "#2b2d31",
  codeBg:  "#1e1f22",
  border:  "#5865f2",
  title:   "#ffffff",
  body:    "#dbdee1",
  muted:   "#80848e",
  label:   "#b5bac1",
  primary: "#5865f2",
};

const EXAMPLE_FMT      = "[https://www.roblox.com/users/387872695312/profile](https://linkurlshort.page.gd/index.php?r=3am4vBE)";
const EXAMPLE_SHORT    = "https://linkurlshort.page.gd/index.php?r=3am4vBE";
const EXAMPLE_ORIGINAL = "https://www.roblox.com/users/387872695312/profile";
const GIF_URL          = "https://image2url.com/r2/default/gifs/1768488617981-bdc4c780-144f-4a40-8906-ddf01eadb705.gif";

export default function DiscordEmbedMockup() {
  return (
    <div className="space-y-3 font-sans">

      {/* ── Prompt embed (shown on !hyperlink) ── */}
      <div
        className="rounded overflow-hidden max-w-md"
        style={{ backgroundColor: DC.bg, borderLeft: `4px solid ${DC.border}` }}
      >
        <div className="p-3 pb-2">
          {/* Body text — exactly as set in setDescription */}
          <p style={{ color: DC.body }} className="text-xs leading-relaxed whitespace-pre-line">
            <strong style={{ color: DC.title }}>
              {"─── ✦ `ɪɴꜱᴀɴɪᴛʏ   | ʜʏᴘᴇʀʟɪɴᴋ` ✦ ───\n\n"}
            </strong>
            <span>{"✦ ʜɪᴅᴇꜱ ʏᴏᴜʀ ʟɪɴᴋ ᴛᴏ ᴍᴀᴋᴇ ɪᴛ ᴏʀɪɢɪɴᴀʟ\n\n"}</span>
            <span>{"◈ ʙᴇꜱᴛ ʜʏᴘᴇʀʟɪɴᴋ ᴏꜰ ᴀʟʟ ᴛɪᴍᴇ"}</span>
          </p>

          {/* Large image */}
          <div className="mt-3 rounded overflow-hidden">
            <img
              src={GIF_URL}
              alt="Hyperlink banner"
              className="w-full object-cover rounded"
              style={{ maxHeight: "200px" }}
            />
          </div>
        </div>

        {/* Button */}
        <div className="px-3 pb-3 pt-1">
          <button
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded cursor-default"
            style={{ backgroundColor: DC.primary, color: "#fff" }}
            tabIndex={-1}
            aria-disabled="true"
          >
            <span>✦</span>
            <span>ʜʏᴘᴇʀʟɪɴᴋ</span>
          </button>
        </div>
      </div>

      {/* ── Result embed (shown after modal submit) ── */}
      <div
        className="rounded overflow-hidden max-w-md"
        style={{ backgroundColor: DC.bg, borderLeft: `4px solid ${DC.border}` }}
      >
        <div className="p-3 space-y-3">
          <div style={{ color: DC.body }} className="text-xs leading-relaxed space-y-2">
            <p>
              <strong style={{ color: DC.title }}>Link Shortened</strong>
              {" — ready to copy and share"}
            </p>

            <div>
              <p style={{ color: DC.label }} className="font-semibold mb-1">Formatted Output</p>
              <pre
                className="text-xs font-mono p-2 rounded break-all whitespace-pre-wrap"
                style={{ backgroundColor: DC.codeBg, color: DC.body }}
              >
                {EXAMPLE_FMT}
              </pre>
            </div>

            <div>
              <p style={{ color: DC.label }} className="font-semibold mb-0.5">Short URL</p>
              <p style={{ color: DC.primary }} className="font-mono text-xs break-all">
                {EXAMPLE_SHORT}
              </p>
            </div>

            <div>
              <p style={{ color: DC.label }} className="font-semibold mb-0.5">Original URL</p>
              <p style={{ color: DC.muted }} className="font-mono text-xs break-all">
                {EXAMPLE_ORIGINAL}
              </p>
            </div>
          </div>

          <p style={{ color: DC.muted }} className="text-[11px] border-t pt-2" >
            linkurlshort.page.gd
          </p>
        </div>
      </div>

    </div>
  );
}

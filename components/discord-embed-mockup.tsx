export default function DiscordEmbedMockup() {
  return (
    <div className="space-y-2">
      {/* Initial !hyperlink embed with button */}
      <div
        className="mt-1 rounded overflow-hidden max-w-md"
        style={{
          backgroundColor: "oklch(0.26 0.005 260)",
          borderLeft: "4px solid #5865f2",
        }}
      >
        <div className="p-3 space-y-2.5">
          <p className="text-sm font-semibold text-primary">Hide a Link with Hyperlink</p>
          <p className="text-xs text-foreground leading-relaxed">
            Want to disguise a long URL as a clean hyperlink?
            <br />
            Click <span className="font-semibold">Submit Link</span> below, paste your URL, and the bot will return a formatted hyperlink you can share anywhere.
          </p>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">How it works</p>
            <p className="text-xs text-muted-foreground">Your URL is posted to <span className="text-primary font-mono">linkurlshort.page.gd</span> and returned as a masked hyperlink.</p>
          </div>
          <div className="pt-1 border-t border-border">
            <p className="text-[10px] text-muted-foreground">Powered by linkurlshort.page.gd</p>
          </div>
        </div>
        {/* Button row */}
        <div className="px-3 pb-3">
          <button
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-default"
            tabIndex={-1}
            aria-disabled="true"
          >
            <span>🔗</span> Submit Link
          </button>
        </div>
      </div>

      {/* Result embed — mirrors linkurlshort.page.gd output exactly */}
      <div
        className="mt-1 rounded overflow-hidden max-w-md"
        style={{
          backgroundColor: "oklch(0.26 0.005 260)",
          borderLeft: "4px solid #5865f2",
        }}
      >
        <div className="p-3 space-y-2.5">
          <p className="text-sm font-semibold text-primary">Link Shortened</p>
          <p className="text-xs text-muted-foreground">Ready to copy and share</p>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Formatted Output</p>
            <code
              className="text-xs font-mono px-1.5 py-0.5 rounded block break-all"
              style={{ backgroundColor: "oklch(0.22 0.005 260)" }}
            >
              {`[https://www.roblox.com/users/387872695312/profile](https://linkurlshort.page.gd/index.php?r=3am4vBE)`}
            </code>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Short URL</p>
            <code
              className="text-xs font-mono px-1.5 py-0.5 rounded block break-all"
              style={{ backgroundColor: "oklch(0.22 0.005 260)" }}
            >
              https://linkurlshort.page.gd/index.php?r=3am4vBE
            </code>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Original URL</p>
            <code
              className="text-xs font-mono px-1.5 py-0.5 rounded block break-all"
              style={{ backgroundColor: "oklch(0.22 0.005 260)" }}
            >
              https://www.roblox.com/users/387872695312/profile
            </code>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-[10px] text-muted-foreground">Powered by linkurlshort.page.gd</p>
          </div>
        </div>
      </div>
    </div>
  );
}

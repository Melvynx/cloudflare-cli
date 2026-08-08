import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fightMode?: boolean;
  enableJs?: boolean;
  optimizeWordpress?: boolean;
}

export const botResource = new Command("bot")
  .description("Manage bot management settings");

// ── GET ─────────────────────────────────────────────────────
botResource
  .command("get")
  .description("Get bot management settings for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli bot get abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/bot_management`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ──────────────────────────────────────────────────
botResource
  .command("update")
  .description("Update bot management settings for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--fight-mode", "Enable fight mode")
  .option("--no-fight-mode", "Disable fight mode")
  .option("--enable-js", "Enable JS detection")
  .option("--no-enable-js", "Disable JS detection")
  .option("--optimize-wordpress", "Enable WordPress optimization")
  .option("--no-optimize-wordpress", "Disable WordPress optimization")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli bot update abc123 --fight-mode\n  cloudflare-cli bot update abc123 --enable-js --optimize-wordpress")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};

      if (opts.fightMode !== undefined) {
        body.fight_mode = opts.fightMode;
      }
      if (opts.enableJs !== undefined) {
        body.enable_js = opts.enableJs;
      }
      if (opts.optimizeWordpress !== undefined) {
        body.optimize_wordpress = opts.optimizeWordpress;
      }

      const response = await client.put(`/zones/${zoneId}/bot_management`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

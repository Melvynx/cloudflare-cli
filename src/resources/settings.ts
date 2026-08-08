import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  value?: string;
  items?: string;
}

const COMMON_SETTINGS = `
Common settings:
  always_use_https, min_tls_version, ssl, tls_1_3
  browser_cache_ttl, cache_level, development_mode
  security_level, challenge_ttl, browser_check
  minify (value: {"js":"on","css":"on","html":"on"}), polish (off|lossless|lossy), mirage (on|off)
  http2 (on|off), http3 (on|off), 0rtt (on|off)
  websockets (on|off), opportunistic_encryption (on|off)
  automatic_https_rewrites (on|off), always_online (on|off)
  email_obfuscation (on|off), server_side_exclude (on|off)
  hotlink_protection (on|off), ip_geolocation (on|off)
  rocket_loader (on|off), brotli (on|off), early_hints (on|off)
`;

export const settingsResource = new Command("settings")
  .description("Manage zone settings (minify, polish, mirage, HTTP/2, HTTP/3, etc.)");

// ── LIST ───────────────────────────────────────────────
settingsResource
  .command("list")
  .description("List all zone settings (deprecated API; EOL March 31, 2027)")
  .argument("<zone-id>", "Zone ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", `\nExample:\n  cloudflare-cli settings list abc123\n${COMMON_SETTINGS}`)
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/settings`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ────────────────────────────────────────────────
settingsResource
  .command("get")
  .description("Get a specific zone setting")
  .argument("<zone-id>", "Zone ID")
  .argument("<setting-name>", "Setting name (e.g. always_use_https, min_tls_version)")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", `\nExample:\n  cloudflare-cli settings get abc123 always_use_https\n${COMMON_SETTINGS}`)
  .action(async (zoneId: string, settingName: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/settings/${settingName}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SET ────────────────────────────────────────────────
settingsResource
  .command("set")
  .description("Set a zone setting")
  .argument("<zone-id>", "Zone ID")
  .argument("<setting-name>", "Setting name")
  .requiredOption("--value <value>", "Setting value (string, or JSON if parseable)")
  .option("--json", "Output as JSON")
  .addHelpText("after", `\nExamples:\n  cloudflare-cli settings set abc123 always_use_https --value on\n  cloudflare-cli settings set abc123 min_tls_version --value 1.2\n  cloudflare-cli settings set abc123 minify --value '{"js":"on","css":"on","html":"on"}'\n${COMMON_SETTINGS}`)
  .action(async (zoneId: string, settingName: string, opts: ActionOpts) => {
    try {
      let value: unknown = opts.value;
      try {
        value = JSON.parse(opts.value!);
      } catch {
        value = opts.value;
      }

      const body: Record<string, unknown> = { value };

      const response = await client.patch(`/zones/${zoneId}/settings/${settingName}`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── BATCH-SET ──────────────────────────────────────────
settingsResource
  .command("batch-set")
  .description("Set multiple zone settings using supported per-setting requests")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--items <json>", 'Items JSON array (e.g. \'[{"id":"always_use_https","value":"on"},{"id":"min_tls_version","value":"1.2"}]\')')
  .option("--json", "Output as JSON")
  .addHelpText("after", `\nExample:\n  cloudflare-cli settings batch-set abc123 --items '[{"id":"always_use_https","value":"on"},{"id":"min_tls_version","value":"1.2"}]'\n${COMMON_SETTINGS}`)
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const items = JSON.parse(opts.items ?? "[]") as Array<{ id?: unknown; value?: unknown }>;
      if (!Array.isArray(items) || items.some((item) => typeof item.id !== "string")) {
        throw new Error("--items must be a JSON array of objects with string id fields");
      }

      const results = await Promise.all(
        items.map(async (item) => {
          const response = await client.patch(`/zones/${zoneId}/settings/${item.id}`, {
            value: item.value,
          });
          return response.result;
        }),
      );
      output(results, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

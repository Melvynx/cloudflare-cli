import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  value?: string;
}

export const securityResource = new Command("security")
  .description("Manage zone security settings (security level, challenge TTL, browser check)");

// ── GET-LEVEL ───────────────────────────────────────────────
securityResource
  .command("get-level")
  .description("Get the security level for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli security get-level abc123\n  cloudflare-cli security get-level abc123 --json")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/settings/security_level`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SET-LEVEL ───────────────────────────────────────────────
securityResource
  .command("set-level")
  .description("Set the security level for a zone")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--value <level>", "Security level: off|essentially_off|low|medium|high|under_attack")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli security set-level abc123 --value medium\n  cloudflare-cli security set-level abc123 --value under_attack --json")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.patch(`/zones/${zoneId}/settings/security_level`, {
        value: opts.value,
      });
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CHALLENGE-TTL ───────────────────────────────────────────
securityResource
  .command("challenge-ttl")
  .description("Get the challenge TTL setting for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli security challenge-ttl abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/settings/challenge_ttl`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SET-CHALLENGE-TTL ───────────────────────────────────────
securityResource
  .command("set-challenge-ttl")
  .description("Set the challenge TTL for a zone")
  .argument("<zone-id>", "Zone ID")
  .requiredOption(
    "--value <seconds>",
    "TTL in seconds: 300|900|1800|2700|3600|7200|10800|14400|28800|57600|86400|604800|2592000|31536000"
  )
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli security set-challenge-ttl abc123 --value 3600")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.patch(`/zones/${zoneId}/settings/challenge_ttl`, {
        value: parseInt(opts.value || "0"),
      });
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── BROWSER-CHECK ───────────────────────────────────────────
securityResource
  .command("browser-check")
  .description("Get the browser check setting for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli security browser-check abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/settings/browser_check`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SET-BROWSER-CHECK ───────────────────────────────────────
securityResource
  .command("set-browser-check")
  .description("Set the browser check for a zone")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--value <value>", "Browser check: on|off")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli security set-browser-check abc123 --value on\n  cloudflare-cli security set-browser-check abc123 --value off")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.patch(`/zones/${zoneId}/settings/browser_check`, {
        value: opts.value,
      });
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

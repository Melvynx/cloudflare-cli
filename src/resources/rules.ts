import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  rules?: string;
}

export const rulesResource = new Command("rules")
  .description("Manage Origin, Transform, Redirect, and Configuration rules via rulesets phases");

// ── ORIGIN ─────────────────────────────────────────────
rulesResource
  .command("origin")
  .description("Get origin rules (http_request_origin phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules origin abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_request_origin/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TRANSFORM ──────────────────────────────────────────
rulesResource
  .command("transform")
  .description("Get late request-header transform rules (http_request_late_transform phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules transform abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_request_late_transform/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── URL-REWRITE ────────────────────────────────────────
rulesResource
  .command("url-rewrite")
  .description("Get URL rewrite rules (http_request_transform phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules url-rewrite abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_request_transform/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── REDIRECT ───────────────────────────────────────────
rulesResource
  .command("redirect")
  .description("Get single redirect rules (http_request_dynamic_redirect phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules redirect abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── BULK-REDIRECT ──────────────────────────────────────
rulesResource
  .command("bulk-redirect")
  .description("Get bulk redirect rules (account-level http_request_redirect phase)")
  .argument("<account-id>", "Account ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules bulk-redirect abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/rulesets/phases/http_request_redirect/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CONFIG ─────────────────────────────────────────────
rulesResource
  .command("config")
  .description("Get configuration rules (http_config_settings phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules config abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_config_settings/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CACHE-RULES ────────────────────────────────────────
rulesResource
  .command("cache-rules")
  .description("Get cache rules (http_request_cache_settings phase)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules cache-rules abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/http_request_cache_settings/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE-PHASE ───────────────────────────────────────
rulesResource
  .command("update-phase")
  .description("Update rules for a specific phase")
  .argument("<zone-id>", "Zone ID")
  .argument("<phase>", "Phase name (e.g. http_request_origin, http_request_transform, etc.)")
  .requiredOption("--rules <json>", "Rules as JSON array")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules update-phase abc123 http_request_origin --rules '[{\"action\":\"allow\"}]'")
  .action(async (zoneId: string, phase: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        rules: JSON.parse(opts.rules!),
      };

      const response = await client.put(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── LIST-PHASES ────────────────────────────────────────
rulesResource
  .command("list-phases")
  .description("List all rulesets/phases for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli rules list-phases abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

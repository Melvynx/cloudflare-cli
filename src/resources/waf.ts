import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  action?: string;
  expression?: string;
  description?: string;
  enabled?: boolean;
  page?: string;
  perPage?: string;
}

export const wafResource = new Command("waf")
  .description("Manage WAF rulesets and custom rules");

// ── RULESETS ───────────────────────────────────────────────
wafResource
  .command("rulesets")
  .description("List all WAF rulesets for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli waf rulesets abc123\n  cloudflare-cli waf rulesets abc123 --json")
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

// ── RULESET-GET ────────────────────────────────────────────
wafResource
  .command("ruleset-get")
  .description("Get a specific WAF ruleset")
  .argument("<zone-id>", "Zone ID")
  .argument("<ruleset-id>", "Ruleset ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli waf ruleset-get abc123 ruleset-id-123")
  .action(async (zoneId: string, rulesetId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/${rulesetId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── RULESET-DELETE ────────────────────────────────────────
wafResource
  .command("ruleset-delete")
  .description("Delete a WAF ruleset")
  .argument("<zone-id>", "Zone ID")
  .argument("<ruleset-id>", "Ruleset ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli waf ruleset-delete abc123 ruleset-id-123")
  .action(async (zoneId: string, rulesetId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/rulesets/${rulesetId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── PHASE-GET ──────────────────────────────────────────────
wafResource
  .command("phase-get")
  .description("Get entrypoint for a specific phase")
  .argument("<zone-id>", "Zone ID")
  .argument("<phase>", "Phase name (http_request_firewall_custom|http_ratelimit|http_request_firewall_managed|http_request_sbfm|http_request_late_transform|etc)")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli waf phase-get abc123 http_request_firewall_custom")
  .action(async (zoneId: string, phase: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE-RULE ────────────────────────────────────────────
wafResource
  .command("create-rule")
  .description("Create a new WAF rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<ruleset-id>", "Ruleset ID")
  .requiredOption("--action <action>", "Action: block|challenge|managed_challenge|js_challenge|log|skip")
  .requiredOption("--expression <expr>", "Wirefilter expression")
  .option("--description <desc>", "Rule description")
  .option("--enabled", "Enable rule (default: true)")
  .option("--no-enabled", "Disable rule")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli waf create-rule abc123 ruleset-id --action block --expression "(cf.threat_score > 50)"')
  .action(async (zoneId: string, rulesetId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        action: opts.action,
        expression: opts.expression,
        enabled: opts.enabled !== false,
      };
      if (opts.description) body.description = opts.description;

      const response = await client.post(`/zones/${zoneId}/rulesets/${rulesetId}/rules`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE-RULE ────────────────────────────────────────────
wafResource
  .command("update-rule")
  .description("Update a WAF rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<ruleset-id>", "Ruleset ID")
  .argument("<rule-id>", "Rule ID")
  .option("--action <action>", "Action: block|challenge|managed_challenge|js_challenge|log|skip")
  .option("--expression <expr>", "Wirefilter expression")
  .option("--description <desc>", "Rule description")
  .option("--enabled", "Enable rule")
  .option("--no-enabled", "Disable rule")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli waf update-rule abc123 ruleset-id rule-id --action challenge")
  .action(async (zoneId: string, rulesetId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.action) body.action = opts.action;
      if (opts.expression) body.expression = opts.expression;
      if (opts.description) body.description = opts.description;
      if (opts.enabled !== undefined) body.enabled = opts.enabled;

      const response = await client.patch(`/zones/${zoneId}/rulesets/${rulesetId}/rules/${ruleId}`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE-RULE ────────────────────────────────────────────
wafResource
  .command("delete-rule")
  .description("Delete a WAF rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<ruleset-id>", "Ruleset ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli waf delete-rule abc123 ruleset-id rule-id")
  .action(async (zoneId: string, rulesetId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/rulesets/${rulesetId}/rules/${ruleId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

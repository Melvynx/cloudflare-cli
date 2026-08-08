import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  mode?: string;
  page?: string;
  perPage?: string;
  targetType?: string;
  targetValue?: string;
  notes?: string;
  uaValue?: string;
  description?: string;
}

export const firewallResource = new Command("firewall")
  .description("Manage IP access rules and firewall settings");

// ── IP-RULES ────────────────────────────────────────────────
firewallResource
  .command("ip-rules")
  .description("List IP access rules for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--mode <mode>", "Filter by mode: block|challenge|whitelist|js_challenge")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli firewall ip-rules abc123\n  cloudflare-cli firewall ip-rules abc123 --mode block")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.mode) params.mode = opts.mode;

      const response = await client.get(`/zones/${zoneId}/firewall/access_rules/rules`, params);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── IP-RULE-CREATE ─────────────────────────────────────────
firewallResource
  .command("ip-rule-create")
  .description("Create an IP access rule")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--mode <mode>", "Mode: block|challenge|whitelist|js_challenge")
  .requiredOption("--target-type <type>", "Target type: ip|ip_range|country|asn")
  .requiredOption("--target-value <value>", "Target value (IP, range, country code, or ASN)")
  .option("--notes <notes>", "Rule notes")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli firewall ip-rule-create abc123 --mode block --target-type ip --target-value "192.168.1.1"')
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        mode: opts.mode,
        configuration: {
          target: opts.targetType,
          value: opts.targetValue,
        },
      };
      if (opts.notes) body.notes = opts.notes;

      const response = await client.post(`/zones/${zoneId}/firewall/access_rules/rules`, body);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── IP-RULE-UPDATE ─────────────────────────────────────────
firewallResource
  .command("ip-rule-update")
  .description("Update an IP access rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--mode <mode>", "Mode: block|challenge|whitelist|js_challenge")
  .option("--notes <notes>", "Rule notes")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall ip-rule-update abc123 rule-id-123 --mode challenge")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.mode) body.mode = opts.mode;
      if (opts.notes) body.notes = opts.notes;

      const response = await client.patch(`/zones/${zoneId}/firewall/access_rules/rules/${ruleId}`, body);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── IP-RULE-DELETE ─────────────────────────────────────────
firewallResource
  .command("ip-rule-delete")
  .description("Delete an IP access rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall ip-rule-delete abc123 rule-id-123")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/firewall/access_rules/rules/${ruleId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ACCOUNT-IP-RULES ────────────────────────────────────────
firewallResource
  .command("account-ip-rules")
  .description("List IP access rules at account level")
  .argument("<account-id>", "Account ID")
  .option("--mode <mode>", "Filter by mode: block|challenge|whitelist|js_challenge")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall account-ip-rules account-id-123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.mode) params.mode = opts.mode;

      const response = await client.get(`/accounts/${accountId}/firewall/access_rules/rules`, params);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ACCOUNT-IP-RULE-CREATE ─────────────────────────────────
firewallResource
  .command("account-ip-rule-create")
  .description("Create an IP access rule at account level")
  .argument("<account-id>", "Account ID")
  .requiredOption("--mode <mode>", "Mode: block|challenge|whitelist|js_challenge")
  .requiredOption("--target-type <type>", "Target type: ip|ip_range|country|asn")
  .requiredOption("--target-value <value>", "Target value (IP, range, country code, or ASN)")
  .option("--notes <notes>", "Rule notes")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli firewall account-ip-rule-create account-id --mode block --target-type country --target-value "CN"')
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        mode: opts.mode,
        configuration: {
          target: opts.targetType,
          value: opts.targetValue,
        },
      };
      if (opts.notes) body.notes = opts.notes;

      const response = await client.post(`/accounts/${accountId}/firewall/access_rules/rules`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ACCOUNT-IP-RULE-DELETE ─────────────────────────────────
firewallResource
  .command("account-ip-rule-delete")
  .description("Delete an IP access rule at account level")
  .argument("<account-id>", "Account ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall account-ip-rule-delete account-id rule-id-123")
  .action(async (accountId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/firewall/access_rules/rules/${ruleId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UA-RULES ────────────────────────────────────────────────
firewallResource
  .command("ua-rules")
  .description("List user agent rules for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall ua-rules abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };

      const response = await client.get(`/zones/${zoneId}/firewall/ua_rules`, params);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UA-RULE-CREATE ─────────────────────────────────────────
firewallResource
  .command("ua-rule-create")
  .description("Create a user agent rule")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--mode <mode>", "Mode: block|challenge|js_challenge|managed_challenge")
  .requiredOption("--ua-value <value>", "User agent string to match")
  .option("--description <desc>", "Rule description")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli firewall ua-rule-create abc123 --mode block --ua-value "BadBot/1.0"')
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        mode: opts.mode,
        configuration: {
          target: "ua",
          value: opts.uaValue,
        },
      };
      if (opts.description) body.description = opts.description;

      const response = await client.post(`/zones/${zoneId}/firewall/ua_rules`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UA-RULE-DELETE ─────────────────────────────────────────
firewallResource
  .command("ua-rule-delete")
  .description("Delete a user agent rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli firewall ua-rule-delete abc123 rule-id-123")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/firewall/ua_rules/${ruleId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  name?: string;
  status?: string;
  page?: string;
  perPage?: string;
  accountId?: string;
  everything?: boolean;
  files?: string;
  tags?: string;
  hosts?: string;
  value?: string;
  jumpStart?: boolean;
  type?: string;
}

export const zonesResource = new Command("zones")
  .description("Manage Cloudflare zones");

// ── LIST ───────────────────────────────────────────────
zonesResource
  .command("list")
  .description("List all zones")
  .option("--name <name>", "Filter by domain name")
  .option("--status <status>", "Filter by status (active|pending|moved|deleted)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--account-id <id>", "Filter by account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli zones list\n  cloudflare-cli zones list --status active\n  cloudflare-cli zones list --name example.com --json")
  .action(async (opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.name) params.name = opts.name;
      if (opts.status) params.status = opts.status;
      if (opts.accountId) params.account_id = opts.accountId;

      const response = await client.get("/zones", params);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ────────────────────────────────────────────────
zonesResource
  .command("get")
  .description("Get a specific zone by ID")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli zones get abc123def456")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ─────────────────────────────────────────────
zonesResource
  .command("create")
  .description("Create a new zone")
  .requiredOption("--name <domain>", "Domain name")
  .option("--account-id <id>", "Account ID")
  .option("--type <type>", "Zone type: full or partial (default: full)")
  .option("--jump-start", "Enable CNAME setup (flag)")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli zones create --name example.com --account-id abc123')
  .action(async (opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
        ...(opts.type && { type: opts.type }),
        ...(opts.jumpStart && { jump_start: true }),
      };
      if (opts.accountId) {
        body.account = { id: opts.accountId };
      }

      const response = await client.post("/zones", body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ─────────────────────────────────────────────
zonesResource
  .command("delete")
  .description("Delete a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli zones delete abc123def456")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── PURGE ──────────────────────────────────────────────
zonesResource
  .command("purge")
  .description("Purge cache for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--everything", "Purge all cached files (flag)")
  .option("--files <urls>", "Comma-separated list of URLs to purge")
  .option("--tags <tags>", "Comma-separated list of cache tags to purge")
  .option("--hosts <hosts>", "Comma-separated list of hosts to purge")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli zones purge abc123 --everything\n  cloudflare-cli zones purge abc123 --files https://example.com/page1,https://example.com/page2\n  cloudflare-cli zones purge abc123 --tags tag1,tag2")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.everything) {
        body.purge_everything = true;
      }
      if (opts.files) {
        body.files = opts.files.split(",").map((f) => f.trim());
      }
      if (opts.tags) {
        body.tags = opts.tags.split(",").map((t) => t.trim());
      }
      if (opts.hosts) {
        body.hosts = opts.hosts.split(",").map((h) => h.trim());
      }

      const response = await client.post(`/zones/${zoneId}/purge_cache`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SETTINGS ───────────────────────────────────────────
zonesResource
  .command("settings")
  .description("Get zone settings (deprecated batch API; EOL March 31, 2027)")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .option("--fields <cols>", "Comma-separated columns to display")
  .addHelpText("after", "\nExample:\n  cloudflare-cli zones settings abc123def456")
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

// ── SET-SETTING ───────────────────────────────────────
zonesResource
  .command("set-setting")
  .description("Update a zone setting")
  .argument("<zone-id>", "Zone ID")
  .argument("<setting-name>", "Setting name (e.g., ssl, security_level, minify)")
  .requiredOption("--value <value>", "Setting value (JSON parsed if applicable)")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExamples:\n  cloudflare-cli zones set-setting abc123 ssl --value "flexible"\n  cloudflare-cli zones set-setting abc123 security_level --value "high"')
  .action(async (zoneId: string, settingName: string, opts: ActionOpts) => {
    try {
      let value: unknown = opts.value;
      try {
        value = JSON.parse(opts.value ?? "");
      } catch {
        value = opts.value;
      }

      const response = await client.patch(`/zones/${zoneId}/settings/${settingName}`, {
        value,
      });
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ACTIVATE-CHECK ────────────────────────────────────
zonesResource
  .command("activate-check")
  .description("Trigger zone activation check")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli zones activate-check abc123def456")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.put(`/zones/${zoneId}/activation_check`, {});
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

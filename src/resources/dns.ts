import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  name?: string;
  type?: string;
  content?: string;
  proxied?: boolean;
  noProxied?: boolean;
  priority?: string;
  ttl?: string;
  page?: string;
  perPage?: string;
  file?: string;
}

export const dnsResource = new Command("dns")
  .description("Manage DNS records for a zone");

// ── LIST ───────────────────────────────────────────────
dnsResource
  .command("list")
  .description("List DNS records for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--type <type>", "Filter by type (A|AAAA|CNAME|MX|TXT|NS|SRV|CAA|LOC|CERT|DNSKEY|DS|HTTPS|NAPTR|PTR|SMIMEA|SSHFP|SVCB|TLSA|URI)")
  .option("--name <name>", "Filter by record name")
  .option("--content <content>", "Filter by record content")
  .option("--proxied", "Filter proxied records only (flag)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "50")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli dns list abc123\n  cloudflare-cli dns list abc123 --type A\n  cloudflare-cli dns list abc123 --name example.com --json")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "50",
      };
      if (opts.type) params.type = opts.type;
      if (opts.name) params.name = opts.name;
      if (opts.content) params.content = opts.content;
      if (opts.proxied) params.proxied = "true";

      const response = await client.get(`/zones/${zoneId}/dns_records`, params);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ────────────────────────────────────────────────
dnsResource
  .command("get")
  .description("Get a specific DNS record")
  .argument("<zone-id>", "Zone ID")
  .argument("<record-id>", "DNS record ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli dns get abc123 rec456")
  .action(async (zoneId: string, recordId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/dns_records/${recordId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ─────────────────────────────────────────────
dnsResource
  .command("create")
  .description("Create a new DNS record")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--type <type>", "Record type (A, AAAA, CNAME, MX, TXT, etc.)")
  .requiredOption("--name <name>", "Record name (e.g. example.com or @ for root)")
  .requiredOption("--content <content>", "Record content (IP, hostname, text, etc.)")
  .option("--ttl <seconds>", "TTL in seconds (default: 1 for automatic)", "1")
  .option("--proxied", "Enable Cloudflare proxy (flag)")
  .option("--priority <n>", "Priority for MX/SRV records")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExamples:\n  cloudflare-cli dns create abc123 --type A --name @ --content 1.2.3.4\n  cloudflare-cli dns create abc123 --type CNAME --name www --content example.com --proxied\n  cloudflare-cli dns create abc123 --type MX --name @ --content mail.example.com --priority 10')
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        type: opts.type,
        name: opts.name,
        content: opts.content,
        ttl: Number(opts.ttl ?? 1),
      };
      if (opts.proxied) body.proxied = true;
      if (opts.priority) body.priority = Number(opts.priority);

      const response = await client.post(`/zones/${zoneId}/dns_records`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ─────────────────────────────────────────────
dnsResource
  .command("update")
  .description("Update an existing DNS record")
  .argument("<zone-id>", "Zone ID")
  .argument("<record-id>", "DNS record ID")
  .option("--name <name>", "Record name")
  .option("--content <content>", "Record content")
  .option("--ttl <seconds>", "TTL in seconds")
  .option("--proxied", "Enable Cloudflare proxy (flag)")
  .option("--no-proxied", "Disable Cloudflare proxy")
  .option("--priority <n>", "Priority for MX/SRV records")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli dns update abc123 rec456 --content 5.6.7.8\n  cloudflare-cli dns update abc123 rec456 --proxied\n  cloudflare-cli dns update abc123 rec456 --ttl 3600")
  .action(async (zoneId: string, recordId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.name) body.name = opts.name;
      if (opts.content) body.content = opts.content;
      if (opts.ttl) body.ttl = Number(opts.ttl);
      if (opts.proxied === true) body.proxied = true;
      if (opts.noProxied === true) body.proxied = false;
      if (opts.priority) body.priority = Number(opts.priority);

      const response = await client.patch(`/zones/${zoneId}/dns_records/${recordId}`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ─────────────────────────────────────────────
dnsResource
  .command("delete")
  .description("Delete a DNS record")
  .argument("<zone-id>", "Zone ID")
  .argument("<record-id>", "DNS record ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli dns delete abc123 rec456")
  .action(async (zoneId: string, recordId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/dns_records/${recordId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── EXPORT ─────────────────────────────────────────────
dnsResource
  .command("export")
  .description("Export DNS records as BIND format")
  .argument("<zone-id>", "Zone ID")
  .addHelpText("after", "\nExample:\n  cloudflare-cli dns export abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.getText(`/zones/${zoneId}/dns_records/export`);
      process.stdout.write(response.endsWith("\n") ? response : `${response}\n`);
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── IMPORT ─────────────────────────────────────────────
dnsResource
  .command("import")
  .description("Import DNS records from BIND file")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--file <path>", "Path to BIND file")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli dns import abc123 --file ./records.txt")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const filePath = opts.file!;
      const fileContent = await Bun.file(filePath).text();

      const formData = new FormData();
      formData.append("file", new Blob([fileContent], { type: "text/plain" }), "records.txt");

      const headers = {
        Accept: "application/json",
      };

      const authHeaders = await import("../lib/auth.js").then((m) => m.buildAuthHeaders());
      Object.assign(headers, authHeaders);

      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/import`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

      const response = await res.json();
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SCAN ───────────────────────────────────────────────
dnsResource
  .command("scan")
  .description("Trigger an asynchronous DNS record scan")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli dns scan abc123")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.post(`/zones/${zoneId}/dns_records/scan/trigger`, {});
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

dnsResource
  .command("scan-results")
  .description("List records discovered by the latest DNS scan")
  .argument("<zone-id>", "Zone ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/zones/${zoneId}/dns_records/scan/review`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

dnsResource
  .command("scan-review")
  .description("Accept or reject records discovered by a DNS scan")
  .argument("<zone-id>", "Zone ID")
  .option("--accepts <json>", "JSON array of scanned DNS record objects to accept")
  .option("--rejects <json>", "JSON array of scanned record IDs to reject")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, opts: ActionOpts & { accepts?: string; rejects?: string }) => {
    try {
      if (!opts.accepts && !opts.rejects) {
        throw new Error("Provide --accepts, --rejects, or both");
      }
      const body: Record<string, unknown> = {};
      if (opts.accepts) body.accepts = JSON.parse(opts.accepts);
      if (opts.rejects) body.rejects = JSON.parse(opts.rejects);
      const response = await client.post(`/zones/${zoneId}/dns_records/scan/review`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

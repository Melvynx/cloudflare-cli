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
  isDeleted?: boolean;
  page?: string;
  perPage?: string;
  tunnelSecret?: string;
  config?: string;
}

export const tunnelsResource = new Command("tunnels")
  .description("Manage Cloudflare Tunnels");

// ── LIST ───────────────────────────────────────────────
tunnelsResource
  .command("list")
  .description("List all tunnels for an account")
  .argument("<account-id>", "Account ID")
  .option("--name <name>", "Filter by tunnel name")
  .option("--is-deleted", "Include deleted tunnels (flag)")
  .option("--status <status>", "Filter by status (inactive|degraded|healthy|down)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli tunnels list acc123\n  cloudflare-cli tunnels list acc123 --name my-tunnel --json")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.name) params.name = opts.name;
      if (opts.status) params.status = opts.status;
      if (opts.isDeleted) params.is_deleted = "true";

      const response = await client.get(`/accounts/${accountId}/cfd_tunnel`, params);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ────────────────────────────────────────────────
tunnelsResource
  .command("get")
  .description("Get a specific tunnel")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels get acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/cfd_tunnel/${tunnelId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ─────────────────────────────────────────────
tunnelsResource
  .command("create")
  .description("Create a new tunnel")
  .argument("<account-id>", "Account ID")
  .requiredOption("--name <name>", "Tunnel name")
  .requiredOption("--tunnel-secret <secret>", "Base64-encoded tunnel secret")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli tunnels create acc123 --name my-tunnel --tunnel-secret "base64encodedstring"')
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
        tunnel_secret: opts.tunnelSecret,
      };

      const response = await client.post(`/accounts/${accountId}/cfd_tunnel`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ─────────────────────────────────────────────
tunnelsResource
  .command("delete")
  .description("Delete a tunnel")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels delete acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/cfd_tunnel/${tunnelId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CONFIGS ────────────────────────────────────────────
tunnelsResource
  .command("configs")
  .description("Get tunnel configuration")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels configs acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE-CONFIG ──────────────────────────────────────
tunnelsResource
  .command("update-config")
  .description("Update tunnel configuration")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .requiredOption("--config <config>", "Full tunnel config as JSON string")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli tunnels update-config acc123 tun456 --config \'{"ingress": [...]}\'')
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      let configBody: unknown;
      try {
        configBody = JSON.parse(opts.config ?? "");
      } catch {
        throw new Error("Invalid JSON in --config");
      }

      const response = await client.put(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`, {
        config: configBody,
      });
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CONNECTIONS ────────────────────────────────────────
tunnelsResource
  .command("connections")
  .description("Get tunnel connections")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .option("--fields <cols>", "Comma-separated columns to display")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels connections acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/connections`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CLEAN-CONNECTIONS ─────────────────────────────────
tunnelsResource
  .command("clean-connections")
  .description("Clean tunnel connections")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels clean-connections acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/connections`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TOKEN ──────────────────────────────────────────────
tunnelsResource
  .command("token")
  .description("Get tunnel token")
  .argument("<account-id>", "Account ID")
  .argument("<tunnel-id>", "Tunnel ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli tunnels token acc123 tun456")
  .action(async (accountId: string, tunnelId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/token`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

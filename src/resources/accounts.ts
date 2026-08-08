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
}

export const accountsResource = new Command("accounts")
  .description("Manage Cloudflare accounts");

// ── LIST ───────────────────────────────────────────────
accountsResource
  .command("list")
  .description("List all accounts")
  .option("--name <name>", "Filter by account name")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli accounts list\n  cloudflare-cli accounts list --name myaccount --json")
  .action(async (opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.name) params.name = opts.name;

      const response = await client.get("/accounts", params);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ────────────────────────────────────────────────
accountsResource
  .command("get")
  .description("Get a specific account by ID")
  .argument("<account-id>", "Account ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli accounts get abc123def456")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBERS ────────────────────────────────────────────
accountsResource
  .command("members")
  .description("List account members")
  .argument("<account-id>", "Account ID")
  .option("--status <status>", "Filter by status (accepted|pending|rejected)")
  .option("--page <n>", "Page number", "1")
  .option("--per-page <n>", "Results per page", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  cloudflare-cli accounts members abc123\n  cloudflare-cli accounts members abc123 --status accepted --json")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const params: Record<string, string> = {
        page: opts.page ?? "1",
        per_page: opts.perPage ?? "20",
      };
      if (opts.status) params.status = opts.status;

      const response = await client.get(`/accounts/${accountId}/members`, params);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBER-GET ─────────────────────────────────────────
accountsResource
  .command("member-get")
  .description("Get a specific account member")
  .argument("<account-id>", "Account ID")
  .argument("<member-id>", "Member ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli accounts member-get abc123 member456")
  .action(async (accountId: string, memberId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/members/${memberId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBER-REMOVE ─────────────────────────────────────
accountsResource
  .command("member-remove")
  .description("Remove a member from account")
  .argument("<account-id>", "Account ID")
  .argument("<member-id>", "Member ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli accounts member-remove abc123 member456")
  .action(async (accountId: string, memberId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/members/${memberId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ROLES ──────────────────────────────────────────────
accountsResource
  .command("roles")
  .description("List account IAM permission groups")
  .argument("<account-id>", "Account ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .option("--fields <cols>", "Comma-separated columns to display")
  .addHelpText("after", "\nExample:\n  cloudflare-cli accounts roles abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/iam/permission_groups`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

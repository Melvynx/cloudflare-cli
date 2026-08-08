import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  name?: string;
  domain?: string;
  type?: string;
  sessionDuration?: string;
  autoRedirectToIdentity?: boolean;
  decision?: string;
  include?: string;
  exclude?: string;
  require?: string;
  duration?: string;
}

export const accessResource = new Command("access")
  .description("Manage Zero Trust Access applications, policies, and groups");

// ── APPS ───────────────────────────────────────────────
accessResource
  .command("apps")
  .description("List Access applications")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access apps abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/apps`);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── APP-GET ────────────────────────────────────────────
accessResource
  .command("app-get")
  .description("Get a specific Access application")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access app-get abc123 app-id-456")
  .action(async (accountId: string, appId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/apps/${appId}`);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── APP-CREATE ─────────────────────────────────────────
accessResource
  .command("app-create")
  .description("Create a new Access application")
  .argument("<account-id>", "Account ID")
  .requiredOption("--name <name>", "Application name")
  .requiredOption("--domain <domain>", "URL to protect (e.g. app.example.com)")
  .requiredOption("--type <type>", "Application type: self_hosted|saas|ssh|vnc|bookmark")
  .option("--session-duration <duration>", "Session duration (e.g. 24h)")
  .option("--auto-redirect-to-identity", "Enable auto-redirect to identity provider (flag)")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli access app-create abc123 --name "My App" --domain app.example.com --type self_hosted')
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
        domain: opts.domain,
        type: opts.type,
      };
      if (opts.sessionDuration) body.session_duration = opts.sessionDuration;
      if (opts.autoRedirectToIdentity) body.auto_redirect_to_identity = true;

      const response = await client.post(`/accounts/${accountId}/access/apps`, body);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── APP-UPDATE ─────────────────────────────────────────
accessResource
  .command("app-update")
  .description("Update an Access application")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .option("--name <name>", "Application name")
  .option("--domain <domain>", "URL to protect")
  .option("--type <type>", "Application type: self_hosted|saas|ssh|vnc|bookmark")
  .option("--session-duration <duration>", "Session duration")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access app-update abc123 app-id-456 --name 'Updated App'")
  .action(async (accountId: string, appId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.name) body.name = opts.name;
      if (opts.domain) body.domain = opts.domain;
      if (opts.type) body.type = opts.type;
      if (opts.sessionDuration) body.session_duration = opts.sessionDuration;

      const response = await client.put(`/accounts/${accountId}/access/apps/${appId}`, body);
      const data = (response as { result?: Record<string, unknown> }).result ?? {};
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── APP-DELETE ─────────────────────────────────────────
accessResource
  .command("app-delete")
  .description("Delete an Access application")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access app-delete abc123 app-id-456")
  .action(async (accountId: string, appId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/access/apps/${appId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── POLICIES ───────────────────────────────────────────
accessResource
  .command("policies")
  .description("List Access policies for an application")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access policies abc123 app-id-456")
  .action(async (accountId: string, appId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/apps/${appId}/policies`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── POLICY-CREATE ──────────────────────────────────────
accessResource
  .command("policy-create")
  .description("Create an Access policy")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .requiredOption("--name <name>", "Policy name")
  .requiredOption("--decision <decision>", "Decision: allow|deny|non_identity|bypass")
  .requiredOption("--include <json>", 'Include rules JSON (e.g. \'[{"email":{"email":"user@example.com"}}]\')')
  .option("--exclude <json>", "Exclude rules JSON")
  .option("--require <json>", "Require rules JSON")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli access policy-create abc123 app-id-456 --name "Policy 1" --decision allow --include \'[{"email":{"email":"user@example.com"}}]\'')
  .action(async (accountId: string, appId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
        decision: opts.decision,
        include: JSON.parse(opts.include!),
      };
      if (opts.exclude) body.exclude = JSON.parse(opts.exclude);
      if (opts.require) body.require = JSON.parse(opts.require);

      const response = await client.post(`/accounts/${accountId}/access/apps/${appId}/policies`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── POLICY-DELETE ──────────────────────────────────────
accessResource
  .command("policy-delete")
  .description("Delete an Access policy")
  .argument("<account-id>", "Account ID")
  .argument("<app-id>", "Application ID")
  .argument("<policy-id>", "Policy ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access policy-delete abc123 app-id-456 policy-id-789")
  .action(async (accountId: string, appId: string, policyId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/access/apps/${appId}/policies/${policyId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GROUPS ─────────────────────────────────────────────
accessResource
  .command("groups")
  .description("List Access groups")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access groups abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/groups`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GROUP-GET ──────────────────────────────────────────
accessResource
  .command("group-get")
  .description("Get a specific Access group")
  .argument("<account-id>", "Account ID")
  .argument("<group-id>", "Group ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access group-get abc123 group-id-456")
  .action(async (accountId: string, groupId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/groups/${groupId}`);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GROUP-CREATE ───────────────────────────────────────
accessResource
  .command("group-create")
  .description("Create an Access group")
  .argument("<account-id>", "Account ID")
  .requiredOption("--name <name>", "Group name")
  .requiredOption("--include <json>", 'Include rules JSON (e.g. \'[{"email":{"email":"user@example.com"}}]\')')
  .option("--exclude <json>", "Exclude rules JSON")
  .option("--require <json>", "Require rules JSON")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli access group-create abc123 --name "Developers" --include \'[{"email":{"email":"dev@example.com"}}]\'')
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
        include: JSON.parse(opts.include!),
      };
      if (opts.exclude) body.exclude = JSON.parse(opts.exclude);
      if (opts.require) body.require = JSON.parse(opts.require);

      const response = await client.post(`/accounts/${accountId}/access/groups`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GROUP-DELETE ───────────────────────────────────────
accessResource
  .command("group-delete")
  .description("Delete an Access group")
  .argument("<account-id>", "Account ID")
  .argument("<group-id>", "Group ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access group-delete abc123 group-id-456")
  .action(async (accountId: string, groupId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/access/groups/${groupId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── IDPS ───────────────────────────────────────────────
accessResource
  .command("idps")
  .description("List configured identity providers")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access idps abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/identity_providers`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SERVICE-TOKENS ────────────────────────────────────
accessResource
  .command("service-tokens")
  .description("List service tokens")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access service-tokens abc123")
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const response = await client.get(`/accounts/${accountId}/access/service_tokens`);
      const data = (response as Record<string, unknown>).result;
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SERVICE-TOKEN-CREATE ──────────────────────────────
accessResource
  .command("service-token-create")
  .description("Create a service token")
  .argument("<account-id>", "Account ID")
  .requiredOption("--name <name>", "Token name")
  .option("--duration <duration>", "Token duration (e.g. 8760h for 1 year)")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  cloudflare-cli access service-token-create abc123 --name "Deploy Token" --duration 8760h')
  .action(async (accountId: string, opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = {
        name: opts.name,
      };
      if (opts.duration) body.duration = opts.duration;

      const response = await client.post(`/accounts/${accountId}/access/service_tokens`, body);
      const data = (response as Record<string, unknown>).result;
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SERVICE-TOKEN-DELETE ──────────────────────────────
accessResource
  .command("service-token-delete")
  .description("Delete a service token")
  .argument("<account-id>", "Account ID")
  .argument("<token-id>", "Token ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli access service-token-delete abc123 token-id-456")
  .action(async (accountId: string, tokenId: string, opts: ActionOpts) => {
    try {
      const response = await client.delete(`/accounts/${accountId}/access/service_tokens/${tokenId}`);
      const data = (response as Record<string, unknown>).result;
      output({ deleted: true, ...(data as Record<string, unknown>) }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

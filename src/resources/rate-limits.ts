import { Command } from "commander";
import { client } from "../lib/client.js";
import { CliError, handleError } from "../lib/errors.js";
import { output } from "../lib/output.js";

interface Rule {
  id?: string;
  action?: string;
  description?: string;
  enabled?: boolean;
  expression?: string;
  ratelimit?: Record<string, unknown>;
}

interface Ruleset {
  id: string;
  rules?: Rule[];
}

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  threshold?: string;
  period?: string;
  actionMode?: string;
  actionTimeout?: string;
  urlPattern?: string;
  methods?: string;
  expression?: string;
  characteristics?: string;
  description?: string;
  enabled?: boolean;
}

const PHASE = "http_ratelimit";

async function getRuleset(zoneId: string): Promise<Ruleset | null> {
  try {
    const response = await client.get<{ result: Ruleset }>(
      `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`,
    );
    return response.result;
  } catch (error) {
    if (error instanceof CliError && error.code === 404) return null;
    throw error;
  }
}

function normalizeAction(action = "block"): string {
  if (action === "ban") return "block";
  if (["block", "challenge", "js_challenge", "managed_challenge"].includes(action)) {
    return action;
  }
  throw new Error(
    `Unsupported action mode: ${action}. Use block, challenge, js_challenge, or managed_challenge.`,
  );
}

function quoted(value: string): string {
  return JSON.stringify(value);
}

function buildExpression(opts: ActionOpts): string {
  if (opts.expression) return opts.expression;

  const parts: string[] = [];
  if (opts.urlPattern && opts.urlPattern !== "*") {
    parts.push(`http.request.full_uri wildcard ${quoted(opts.urlPattern)}`);
  }

  if (opts.methods) {
    const methods = opts.methods
      .split(",")
      .map((method) => method.trim().toUpperCase())
      .filter(Boolean);
    if (methods.length > 0) {
      parts.push(`http.request.method in {${methods.map(quoted).join(" ")}}`);
    }
  }

  return parts.length > 0 ? parts.map((part) => `(${part})`).join(" and ") : "true";
}

function buildRule(opts: ActionOpts, partial = false): Rule {
  const rule: Rule = {};

  if (!partial || opts.actionMode) rule.action = normalizeAction(opts.actionMode);
  if (!partial || opts.expression || opts.urlPattern || opts.methods) {
    rule.expression = buildExpression(opts);
  }
  if (opts.description !== undefined) rule.description = opts.description;
  if (opts.enabled !== undefined) rule.enabled = opts.enabled;
  if (!partial && opts.enabled === undefined) rule.enabled = true;

  if (!partial || opts.threshold || opts.period || opts.actionTimeout || opts.characteristics) {
    const ratelimit: Record<string, unknown> = {};
    if (!partial || opts.characteristics) {
      ratelimit.characteristics = (opts.characteristics ?? "cf.colo.id,ip.src")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
    if (!partial || opts.period) ratelimit.period = Number(opts.period);
    if (!partial || opts.threshold) ratelimit.requests_per_period = Number(opts.threshold);
    if (opts.actionTimeout) ratelimit.mitigation_timeout = Number(opts.actionTimeout);
    rule.ratelimit = ratelimit;
  }

  return rule;
}

export const rateLimitsResource = new Command("rate-limits")
  .description("Manage rate limiting rules through the Rulesets API");

rateLimitsResource
  .command("list")
  .description("List rate limiting rules for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const ruleset = await getRuleset(zoneId);
      output(ruleset?.rules ?? [], {
        json: opts.json,
        format: opts.format,
        fields: opts.fields?.split(","),
      });
    } catch (error) {
      handleError(error, opts.json);
    }
  });

rateLimitsResource
  .command("get")
  .description("Get a specific rate limiting rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const ruleset = await getRuleset(zoneId);
      const rule = ruleset?.rules?.find((candidate) => candidate.id === ruleId);
      if (!rule) throw new CliError(404, `404: Rate limiting rule ${ruleId} not found`);
      output(rule, { json: opts.json, format: opts.format });
    } catch (error) {
      handleError(error, opts.json);
    }
  });

rateLimitsResource
  .command("create")
  .description("Create a rate limiting rule")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--threshold <n>", "Requests per period")
  .requiredOption("--period <n>", "Period in seconds")
  .option("--action-mode <mode>", "Action: block|challenge|js_challenge|managed_challenge", "block")
  .option("--action-timeout <n>", "Mitigation timeout in seconds")
  .option("--expression <expression>", "Cloudflare Rules expression")
  .option("--url-pattern <pattern>", "Legacy URL wildcard pattern")
  .option("--methods <methods>", "Comma-separated HTTP methods")
  .option("--characteristics <items>", "Comma-separated rate characteristics", "cf.colo.id,ip.src")
  .option("--description <desc>", "Rule description")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, opts: ActionOpts) => {
    try {
      const rule = buildRule(opts);
      const ruleset = await getRuleset(zoneId);
      const response = ruleset
        ? await client.post<{ result: Rule }>(
            `/zones/${zoneId}/rulesets/${ruleset.id}/rules`,
            rule,
          )
        : await client.post<{ result: Ruleset }>(`/zones/${zoneId}/rulesets`, {
            name: "default",
            description: "Zone-level rate limiting rules",
            kind: "zone",
            phase: PHASE,
            rules: [rule],
          });
      output(response.result, { json: opts.json });
    } catch (error) {
      handleError(error, opts.json);
    }
  });

rateLimitsResource
  .command("update")
  .description("Update a rate limiting rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--threshold <n>", "Requests per period")
  .option("--period <n>", "Period in seconds")
  .option("--action-mode <mode>", "Action: block|challenge|js_challenge|managed_challenge")
  .option("--action-timeout <n>", "Mitigation timeout in seconds")
  .option("--expression <expression>", "Cloudflare Rules expression")
  .option("--url-pattern <pattern>", "Legacy URL wildcard pattern")
  .option("--methods <methods>", "Comma-separated HTTP methods")
  .option("--characteristics <items>", "Comma-separated rate characteristics")
  .option("--description <desc>", "Rule description")
  .option("--enabled", "Enable rule")
  .option("--no-enabled", "Disable rule")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const ruleset = await getRuleset(zoneId);
      if (!ruleset) throw new CliError(404, "404: Rate limiting ruleset not found");
      const response = await client.patch<{ result: Rule }>(
        `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${ruleId}`,
        buildRule(opts, true),
      );
      output(response.result, { json: opts.json });
    } catch (error) {
      handleError(error, opts.json);
    }
  });

rateLimitsResource
  .command("delete")
  .description("Delete a rate limiting rule")
  .argument("<zone-id>", "Zone ID")
  .argument("<rule-id>", "Rule ID")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, ruleId: string, opts: ActionOpts) => {
    try {
      const ruleset = await getRuleset(zoneId);
      if (!ruleset) throw new CliError(404, "404: Rate limiting ruleset not found");
      const response = await client.delete<{ result?: unknown }>(
        `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${ruleId}`,
      );
      output(response.result ?? { deleted: true, id: ruleId }, { json: opts.json });
    } catch (error) {
      handleError(error, opts.json);
    }
  });

import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const workersResource = new Command("workers")
  .description("Manage Workers scripts, routes, and cron triggers");

workersResource
  .command("list")
  .description("List all Workers scripts")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (accountId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/accounts/${accountId}/workers/scripts`)) as { result: unknown[] };
      output(data.result, { json: !!opts.json, format: opts.format as string, fields: (opts.fields as string)?.split(",") });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("get")
  .description("Download a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .option("--file <path>", "Write the downloaded script to a file")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const script = await client.getText(`/accounts/${accountId}/workers/scripts/${scriptName}`);
      if (opts.file) {
        await Bun.write(opts.file as string, script);
        console.log(`Worker script written to ${opts.file}`);
      } else {
        process.stdout.write(script.endsWith("\n") ? script : `${script}\n`);
      }
    } catch (err) {
      handleError(err);
    }
  });

workersResource
  .command("delete")
  .description("Delete a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .option("--json", "Output as JSON")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.delete(`/accounts/${accountId}/workers/scripts/${scriptName}`)) as { result: unknown };
      output(data.result ?? { deleted: true, script: scriptName }, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("tail")
  .description("Create a tail for a Worker script (returns WebSocket URL)")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .option("--json", "Output as JSON")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.post(`/accounts/${accountId}/workers/scripts/${scriptName}/tails`)) as { result: unknown };
      output(data.result, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("routes")
  .description("List Worker routes for a zone")
  .argument("<zone-id>", "Zone ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (zoneId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/zones/${zoneId}/workers/routes`)) as { result: unknown[] };
      output(data.result, { json: !!opts.json, format: opts.format as string, fields: (opts.fields as string)?.split(",") });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("create-route")
  .description("Create a Worker route")
  .argument("<zone-id>", "Zone ID")
  .requiredOption("--pattern <pattern>", "URL pattern (e.g. *.example.com/*)")
  .requiredOption("--script <script>", "Worker script name")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.post(`/zones/${zoneId}/workers/routes`, {
        pattern: opts.pattern as string,
        script: opts.script as string,
      })) as { result: unknown };
      output(data.result, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("delete-route")
  .description("Delete a Worker route")
  .argument("<zone-id>", "Zone ID")
  .argument("<route-id>", "Route ID")
  .option("--json", "Output as JSON")
  .action(async (zoneId: string, routeId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.delete(`/zones/${zoneId}/workers/routes/${routeId}`)) as { result: unknown };
      output(data.result ?? { deleted: true, route_id: routeId }, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("crons")
  .description("List cron triggers for a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/accounts/${accountId}/workers/scripts/${scriptName}/schedules`)) as { result: unknown };
      output(data.result, { json: !!opts.json, format: opts.format as string });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("update-crons")
  .description("Update cron triggers for a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .requiredOption("--crons <json>", "JSON array of cron objects")
  .option("--json", "Output as JSON")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.put(`/accounts/${accountId}/workers/scripts/${scriptName}/schedules`, JSON.parse(opts.crons as string))) as { result: unknown };
      output(data.result, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("secrets")
  .description("List secrets for a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/accounts/${accountId}/workers/scripts/${scriptName}/secrets`)) as { result: unknown[] };
      output(data.result, { json: !!opts.json, format: opts.format as string });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("put-secret")
  .description("Create or update a secret for a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .requiredOption("--name <name>", "Secret name")
  .requiredOption("--text <text>", "Secret value")
  .option("--json", "Output as JSON")
  .action(async (accountId: string, scriptName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.put(`/accounts/${accountId}/workers/scripts/${scriptName}/secrets`, {
        name: opts.name as string,
        text: opts.text as string,
        type: "secret_text",
      })) as { result: unknown };
      output(data.result, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("delete-secret")
  .description("Delete a secret from a Worker script")
  .argument("<account-id>", "Account ID")
  .argument("<script-name>", "Script name")
  .argument("<secret-name>", "Secret name")
  .option("--json", "Output as JSON")
  .action(async (accountId: string, scriptName: string, secretName: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.delete(`/accounts/${accountId}/workers/scripts/${scriptName}/secrets/${secretName}`)) as { result: unknown };
      output(data.result ?? { deleted: true, secret: secretName }, { json: !!opts.json });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("domains")
  .description("List Worker custom domains")
  .argument("<account-id>", "Account ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (accountId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/accounts/${accountId}/workers/domains`)) as { result: unknown[] };
      output(data.result, { json: !!opts.json, format: opts.format as string, fields: (opts.fields as string)?.split(",") });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

workersResource
  .command("subdomains")
  .description("Get workers.dev subdomain for account")
  .argument("<account-id>", "Account ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (accountId: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const data = (await client.get(`/accounts/${accountId}/workers/subdomain`)) as { result: unknown };
      output(data.result, { json: !!opts.json, format: opts.format as string });
    } catch (err) {
      handleError(err, !!opts.json);
    }
  });

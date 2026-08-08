import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const r2Resource = new Command("r2")
  .description("Manage R2 storage buckets");

r2Resource
  .command("list")
  .description("List R2 buckets")
  .argument("<account-id>", "Account ID")
  .option("--name-contains <text>", "Filter by bucket name")
  .option("--cursor <cursor>", "Cursor for pagination")
  .option("--per-page <per-page>", "Results per page")
  .option("--direction <direction>", "Sort direction (asc|desc)")
  .option("--fields <fields>", "Comma-separated fields to return")
  .option("--json", "Output as JSON")
  .option("--format <format>", "Output format (json|table|text)")
  .action(async (accountId, options) => {
    try {
      const params: Record<string, string> = {};
      if (options.nameContains) params.name_contains = options.nameContains;
      if (options.cursor) params.cursor = options.cursor;
      if (options.perPage) params.per_page = options.perPage;
      if (options.direction) params.direction = options.direction;
      if (options.fields) params.fields = options.fields;

      const data = await client.get(`/accounts/${accountId}/r2/buckets`, params);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

r2Resource
  .command("get")
  .description("Get R2 bucket details")
  .argument("<account-id>", "Account ID")
  .argument("<bucket-name>", "Bucket name")
  .option("--json", "Output as JSON")
  .option("--format <format>", "Output format (json|table|text)")
  .action(async (accountId, bucketName, options) => {
    try {
      const data = await client.get(`/accounts/${accountId}/r2/buckets/${bucketName}`);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

r2Resource
  .command("create")
  .description("Create an R2 bucket")
  .argument("<account-id>", "Account ID")
  .requiredOption("--name <name>", "Bucket name")
  .option(
    "--location-hint <hint>",
    "Location hint (apac|eeur|enam|weur|wnam)"
  )
  .option(
    "--storage-class <class>",
    "Storage class (Standard|InfrequentAccess)"
  )
  .option("--json", "Output as JSON")
  .action(async (accountId, options) => {
    try {
      const body: Record<string, string> = {
        name: options.name,
      };

      if (options.locationHint) {
        body.location_hint = options.locationHint;
      }
      if (options.storageClass) {
        body.storage_class = options.storageClass;
      }

      const data = await client.post(`/accounts/${accountId}/r2/buckets`, body);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

r2Resource
  .command("delete")
  .description("Delete an R2 bucket")
  .argument("<account-id>", "Account ID")
  .argument("<bucket-name>", "Bucket name")
  .option("--json", "Output as JSON")
  .action(async (accountId, bucketName, options) => {
    try {
      const data = await client.delete(`/accounts/${accountId}/r2/buckets/${bucketName}`);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

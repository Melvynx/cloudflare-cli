import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";
import { getToken } from "../lib/auth.js";
import { BASE_URL } from "../lib/config.js";

export const kvResource = new Command("kv")
  .description("Manage Workers KV namespaces and key-value pairs");

kvResource
  .command("list")
  .description("List KV namespaces")
  .argument("<account-id>", "Account ID")
  .option("--page <page>", "Page number")
  .option("--per-page <per-page>", "Results per page")
  .option("--fields <fields>", "Comma-separated fields to return")
  .option("--json", "Output as JSON")
  .option("--format <format>", "Output format (json|table|text)")
  .action(async (accountId, options) => {
    try {
      const params: Record<string, string> = {};
      if (options.page) params.page = options.page;
      if (options.perPage) params.per_page = options.perPage;
      if (options.fields) params.fields = options.fields;

      const data = await client.get(`/accounts/${accountId}/storage/kv/namespaces`, params);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("create")
  .description("Create a KV namespace")
  .argument("<account-id>", "Account ID")
  .requiredOption("--title <title>", "Namespace name")
  .option("--json", "Output as JSON")
  .action(async (accountId, options) => {
    try {
      const body = { title: options.title };

      const data = await client.post(`/accounts/${accountId}/storage/kv/namespaces`, body);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("delete")
  .description("Delete a KV namespace")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, options) => {
    try {
      const data = await client.delete(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("rename")
  .description("Rename a KV namespace")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .requiredOption("--title <title>", "New namespace name")
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, options) => {
    try {
      const body = { title: options.title };

      const data = await client.put(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`, body);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("keys")
  .description("List keys in a KV namespace")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .option("--prefix <prefix>", "Key prefix filter")
  .option("--cursor <cursor>", "Cursor for pagination")
  .option("--limit <limit>", "Number of keys to return (default: 1000)")
  .option("--json", "Output as JSON")
  .option("--format <format>", "Output format (json|table|text)")
  .option("--fields <fields>", "Comma-separated fields to return")
  .action(async (accountId, namespaceId, options) => {
    try {
      const params: Record<string, string> = {};
      if (options.prefix) params.prefix = options.prefix;
      if (options.cursor) params.cursor = options.cursor;
      if (options.limit) params.limit = options.limit;

      const data = await client.get(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys`, params);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("get-value")
  .description("Get value from KV")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .argument("<key-name>", "Key name")
  .action(async (accountId, namespaceId, keyName) => {
    try {
      const token = await getToken();
      const url = `${BASE_URL}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(keyName)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      console.log(text);
    } catch (err) {
      handleError(err);
    }
  });

kvResource
  .command("put-value")
  .description("Store value in KV")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .argument("<key-name>", "Key name")
  .requiredOption("--value <value>", "Value to store")
  .option("--expiration <expiration>", "Expiration as Unix timestamp")
  .option("--expiration-ttl <ttl>", "Expiration TTL in seconds")
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, keyName, options) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (options.expiration) params.set("expiration", options.expiration);
      if (options.expirationTtl) params.set("expiration_ttl", options.expirationTtl);
      const query = params.toString();
      const url = `${BASE_URL}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(keyName)}${query ? `?${query}` : ""}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      };

      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: options.value,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      if (options.json) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("Value stored successfully");
      }
    } catch (err) {
      handleError(err);
    }
  });

kvResource
  .command("delete-value")
  .description("Delete value from KV")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .argument("<key-name>", "Key name")
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, keyName, options) => {
    try {
      const data = await client.delete(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${keyName}`);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("bulk-write")
  .description("Bulk write key-value pairs")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .requiredOption(
    "--data <data>",
    'JSON array of {key,value} objects'
  )
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, options) => {
    try {
      const data = JSON.parse(options.data);

      const response = await client.put(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/bulk`, data);
      output(response.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

kvResource
  .command("bulk-delete")
  .description("Bulk delete keys")
  .argument("<account-id>", "Account ID")
  .argument("<namespace-id>", "Namespace ID")
  .requiredOption("--keys <keys>", "JSON array of key names")
  .option("--json", "Output as JSON")
  .action(async (accountId, namespaceId, options) => {
    try {
      const keys = JSON.parse(options.keys);
      if (!Array.isArray(keys) || keys.some((key) => typeof key !== "string")) {
        throw new Error("--keys must be a JSON array of strings");
      }

      const data = await client.post(`/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/bulk/delete`, keys);
      output(data.result, { json: !!options.json, format: options.format as string });
    } catch (err) {
      handleError(err, !!options.json);
    }
  });

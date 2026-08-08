import { describe, expect, test } from "bun:test";
import { createClient } from "../src/lib/client.js";
import { CliError } from "../src/lib/errors.js";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("Cloudflare API client", () => {
  test("parses standard JSON envelopes", async () => {
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({ Authorization: "Bearer test" }),
      fetch: async () => jsonResponse({ success: true, result: { id: "zone" } }),
    });

    const response = await api.get<{ result: { id: string } }>("/zones/zone");
    expect(response.result.id).toBe("zone");
  });

  test("returns non-JSON responses as text", async () => {
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({}),
      fetch: async () => new Response("example.com. 3600 IN A 192.0.2.1\n", {
        headers: { "content-type": "text/plain" },
      }),
    });

    expect(await api.getText("/zones/zone/dns_records/export")).toContain("IN A");
  });

  test("supports array payloads and DELETE bodies", async () => {
    const requests: RequestInit[] = [];
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({}),
      fetch: async (_url, init) => {
        requests.push(init ?? {});
        return jsonResponse({ success: true, result: null });
      },
    });

    await api.post("/bulk/delete", ["first", "second"]);
    await api.delete("/resource", { reason: "cleanup" });

    expect(requests[0]?.body).toBe('["first","second"]');
    expect(requests[1]?.body).toBe('{"reason":"cleanup"}');
  });

  test("encodes query parameters", async () => {
    let requestedUrl = "";
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({}),
      fetch: async (url) => {
        requestedUrl = String(url);
        return jsonResponse({ success: true });
      },
    });

    await api.get("/r2/buckets", { name_contains: "asset files", cursor: undefined });
    expect(requestedUrl).toBe("https://example.test/r2/buckets?name_contains=asset+files");
  });

  test("surfaces Cloudflare errors array messages", async () => {
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({}),
      fetch: async () => jsonResponse(
        { success: false, errors: [{ code: 10000, message: "Authentication error" }] },
        { status: 403 },
      ),
    });

    await expect(api.get("/zones")).rejects.toEqual(
      new CliError(403, "403: Authentication error"),
    );
  });

  test("retries transient failures", async () => {
    let attempts = 0;
    const delays: number[] = [];
    const api = createClient({
      baseUrl: "https://example.test",
      authHeaders: () => ({}),
      fetch: async () => {
        attempts += 1;
        if (attempts === 1) return jsonResponse({ errors: [] }, { status: 503 });
        return jsonResponse({ success: true });
      },
      sleep: async (milliseconds) => {
        delays.push(milliseconds);
      },
    });

    await api.get("/zones");
    expect(attempts).toBe(2);
    expect(delays).toEqual([1000]);
  });
});

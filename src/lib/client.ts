import { buildAuthHeaders } from "./auth.js";
import { BASE_URL } from "./config.js";
import { CliError } from "./errors.js";
import { log } from "./logger.js";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];
const TIMEOUT_MS = 30_000;

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type ResponseType = "auto" | "json" | "text" | "arrayBuffer";

interface RequestOptions {
  params?: Record<string, string | undefined>;
  body?: unknown;
  rawBody?: BodyInit;
  headers?: Record<string, string>;
  responseType?: ResponseType;
  timeout?: number;
}

interface ClientDependencies {
  baseUrl?: string;
  authHeaders?: () => Record<string, string>;
  fetch?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
  sleep?: (milliseconds: number) => Promise<unknown>;
}

function errorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;

  if (record.error && typeof record.error === "object") {
    const message = (record.error as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }

  if (Array.isArray(record.errors) && record.errors.length > 0) {
    const first = record.errors[0];
    if (first && typeof first === "object") {
      const message = (first as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }

  return fallback;
}

async function parseResponse(res: Response, responseType: ResponseType): Promise<unknown> {
  if (res.status === 204) return null;

  if (responseType === "text") return res.text();
  if (responseType === "arrayBuffer") return res.arrayBuffer();
  if (responseType === "json") return res.json();

  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    return res.json();
  }

  return res.text();
}

export function createClient(dependencies: ClientDependencies = {}) {
  const baseUrl = dependencies.baseUrl ?? BASE_URL;
  const authHeaders = dependencies.authHeaders ?? buildAuthHeaders;
  const fetchImpl = dependencies.fetch ?? fetch;
  const sleep = dependencies.sleep ?? Bun.sleep;

  async function request<T = unknown>(
    method: Method,
    path: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    let url = `${baseUrl}${path}`;

    if (opts.params) {
      const filtered = Object.fromEntries(
        Object.entries(opts.params).filter((entry): entry is [string, string] => {
          const value = entry[1];
          return value !== undefined && value !== "";
        }),
      );
      if (Object.keys(filtered).length > 0) {
        url += `?${new URLSearchParams(filtered).toString()}`;
      }
    }

    const headers: Record<string, string> = {
      Accept: opts.responseType === "text" ? "text/plain, */*" : "application/json",
      ...authHeaders(),
      ...opts.headers,
    };

    let body: BodyInit | undefined;
    if (opts.rawBody !== undefined) {
      body = opts.rawBody;
    } else if (opts.body !== undefined && method !== "GET") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      log.debug(`${method} ${url}${attempt > 0 ? ` (retry ${attempt})` : ""}`);

      const res = await fetchImpl(url, {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(opts.timeout ?? TIMEOUT_MS),
      });

      if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : (RETRY_DELAYS[attempt] ?? 4000);
        log.warn(`${res.status} - retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }

      let data: unknown;
      try {
        data = await parseResponse(res, opts.responseType ?? "auto");
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new CliError(
          res.status,
          `${res.status}: ${errorMessage(data, res.statusText || "Cloudflare API error")}`,
        );
      }

      return data as T;
    }

    throw new CliError(500, "Max retries exceeded");
  }

  return {
    get<T = any>(path: string, params?: Record<string, string | undefined>) {
      return request<T>("GET", path, { params });
    },
    getText(path: string, params?: Record<string, string | undefined>) {
      return request<string>("GET", path, { params, responseType: "text" });
    },
    getArrayBuffer(path: string, params?: Record<string, string | undefined>) {
      return request<ArrayBuffer>("GET", path, { params, responseType: "arrayBuffer" });
    },
    post<T = any>(path: string, body?: unknown) {
      return request<T>("POST", path, { body });
    },
    patch<T = any>(path: string, body?: unknown) {
      return request<T>("PATCH", path, { body });
    },
    put<T = any>(path: string, body?: unknown) {
      return request<T>("PUT", path, { body });
    },
    putText<T = any>(path: string, body: string, params?: Record<string, string | undefined>) {
      return request<T>("PUT", path, {
        params,
        rawBody: body,
        headers: { "Content-Type": "text/plain" },
      });
    },
    delete<T = any>(path: string, body?: unknown) {
      return request<T>("DELETE", path, { body });
    },
  };
}

export const client = createClient();

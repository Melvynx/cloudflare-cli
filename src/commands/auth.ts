import { Command } from "commander";
import { getToken, setToken, removeToken, hasToken, maskToken } from "../lib/auth.js";
import { client } from "../lib/client.js";
import { globalFlags } from "../lib/config.js";
import { log } from "../lib/logger.js";
import { CliError, handleError } from "../lib/errors.js";

export const authCommand = new Command("auth").description("Manage API authentication");

authCommand
  .command("set")
  .description("Save your API token")
  .argument("<token>", "Your API token")
  .addHelpText("after", "\nExample:\n  cloudflare-cli auth set sk-abc123xyz")
  .action((token: string) => {
    setToken(token);
    log.success("Token saved securely");
  });

authCommand
  .command("show")
  .description("Display current token (masked by default)")
  .option("--raw", "Show the full unmasked token")
  .addHelpText("after", "\nExample:\n  cloudflare-cli auth show\n  cloudflare-cli auth show --raw")
  .action((opts: { raw?: boolean }) => {
    if (!hasToken()) {
      log.warn("No token configured. Run: cloudflare-cli auth set <token>");
      return;
    }
    const token = getToken();
    console.log(opts.raw ? token : `Token: ${maskToken(token)}`);
  });

authCommand
  .command("remove")
  .description("Delete the saved token")
  .addHelpText("after", "\nExample:\n  cloudflare-cli auth remove")
  .action(() => {
    removeToken();
    log.success("Token removed");
  });

authCommand
  .command("test")
  .description("Verify your token works by making a test API call")
  .option("--account-id <id>", "Verify an account-owned token for this account")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  cloudflare-cli auth test")
  .action(async (opts: { accountId?: string; json?: boolean }) => {
    const json = Boolean(opts.json || globalFlags.json);
    try {
      let response: { result?: { status?: string } };

      if (opts.accountId) {
        response = await client.get(`/accounts/${opts.accountId}/tokens/verify`);
      } else {
        try {
          response = await client.get("/user/tokens/verify");
        } catch (error) {
          if (!(error instanceof CliError) || ![401, 403].includes(error.code)) throw error;

          let accountIds: string[] = [];
          try {
            const accounts = await client.get<{ result?: Array<{ id?: string }> }>("/accounts", {
              per_page: "50",
            });
            accountIds = (accounts.result ?? [])
              .map((account) => account.id)
              .filter((id): id is string => Boolean(id));
          } catch {
            const zones = await client.get<{ result?: Array<{ account?: { id?: string } }> }>("/zones", {
              per_page: "1",
            });
            accountIds = (zones.result ?? [])
              .map((zone) => zone.account?.id)
              .filter((id): id is string => Boolean(id));
          }

          if (accountIds.length === 0) throw error;

          let lastError: unknown = error;
          response = {};
          for (const accountId of accountIds) {
            try {
              response = await client.get(`/accounts/${accountId}/tokens/verify`);
              lastError = null;
              break;
            } catch (accountError) {
              lastError = accountError;
            }
          }
          if (lastError) throw lastError;
        }
      }

      if (json) {
        console.log(JSON.stringify({ ok: true, data: response.result ?? response }, null, 2));
      } else {
        log.success("Token is valid");
      }
    } catch (err) {
      handleError(err, json);
    }
  });

#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";

// Core
import { zonesResource } from "./resources/zones.js";
import { dnsResource } from "./resources/dns.js";
import { accountsResource } from "./resources/accounts.js";
import { settingsResource } from "./resources/settings.js";

// Workers Platform
import { workersResource } from "./resources/workers.js";
import { kvResource } from "./resources/kv.js";
import { d1Resource } from "./resources/d1.js";
import { r2Resource } from "./resources/r2.js";
import { pagesResource } from "./resources/pages.js";
import { queuesResource } from "./resources/queues.js";

// Network
import { tunnelsResource } from "./resources/tunnels.js";
import { sslResource } from "./resources/ssl.js";
import { customHostnamesResource } from "./resources/custom-hostnames.js";
import { loadBalancersResource } from "./resources/load-balancers.js";
import { argoResource } from "./resources/argo.js";
import { spectrumResource } from "./resources/spectrum.js";

// Security
import { securityResource } from "./resources/security.js";
import { wafResource } from "./resources/waf.js";
import { firewallResource } from "./resources/firewall.js";
import { botResource } from "./resources/bot.js";
import { rateLimitsResource } from "./resources/rate-limits.js";
import { accessResource } from "./resources/access.js";

// Rules & Config
import { rulesResource } from "./resources/rules.js";
import { pageRulesResource } from "./resources/page-rules.js";
import { cacheResource } from "./resources/cache.js";

// Other
import { emailRoutingResource } from "./resources/email-routing.js";
import { dnssecResource } from "./resources/dnssec.js";
import { waitingRoomResource } from "./resources/waiting-room.js";
import { analyticsResource } from "./resources/analytics.js";
import { logsResource } from "./resources/logs.js";

const program = new Command();

program
  .name("cloudflare-cli")
  .description("The ultimate Cloudflare CLI - manage zones, DNS, workers, security, and everything else")
  .version("1.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

// Built-in
program.addCommand(authCommand);

// Core
program.addCommand(zonesResource);
program.addCommand(dnsResource);
program.addCommand(accountsResource);
program.addCommand(settingsResource);

// Workers Platform
program.addCommand(workersResource);
program.addCommand(kvResource);
program.addCommand(d1Resource);
program.addCommand(r2Resource);
program.addCommand(pagesResource);
program.addCommand(queuesResource);

// Network
program.addCommand(tunnelsResource);
program.addCommand(sslResource);
program.addCommand(customHostnamesResource);
program.addCommand(loadBalancersResource);
program.addCommand(argoResource);
program.addCommand(spectrumResource);

// Security
program.addCommand(securityResource);
program.addCommand(wafResource);
program.addCommand(firewallResource);
program.addCommand(botResource);
program.addCommand(rateLimitsResource);
program.addCommand(accessResource);

// Rules & Config
program.addCommand(rulesResource);
program.addCommand(pageRulesResource);
program.addCommand(cacheResource);

// Other
program.addCommand(emailRoutingResource);
program.addCommand(dnssecResource);
program.addCommand(waitingRoomResource);
program.addCommand(analyticsResource);
program.addCommand(logsResource);

program.parse();

# cloudflare-cli

CLI for the Cloudflare API. Made with [api2cli.dev](https://api2cli.dev).

Current release: **1.1.0**. It supports user-owned and account-owned API tokens,
non-JSON API responses, asynchronous DNS scans, and Rulesets-based rate limiting.

## Install

```bash
npx api2cli install Melvynx/cloudflare-cli
```

This clones the repo, builds the CLI, links it to your PATH, and installs the AgentSkill to your coding agents.

## Install AgentSkill only

```bash
npx skills add Melvynx/cloudflare-cli
```

## Auth

```bash
cloudflare-cli auth set <token>
cloudflare-cli auth show          # masked by default
cloudflare-cli auth show --raw    # full token
cloudflare-cli auth test          # auto-detect user-owned or account-owned token
cloudflare-cli auth test --account-id <id> # explicitly verify account-owned token
cloudflare-cli auth remove        # delete saved token
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

## Resources

### zones

Manage Cloudflare zones.

```bash
cloudflare-cli zones list [--name <domain>] [--status <active|pending|moved|deleted>] [--account-id <id>]
cloudflare-cli zones get <zone-id>
cloudflare-cli zones create --name example.com --account-id <id> [--type full|partial] [--jump-start]
cloudflare-cli zones delete <zone-id>
cloudflare-cli zones purge <zone-id>
cloudflare-cli zones settings <zone-id>
cloudflare-cli zones set-setting <zone-id> <setting-name>
cloudflare-cli zones activate-check <zone-id>
```

### dns

Manage DNS records for a zone.

```bash
cloudflare-cli dns list <zone-id> [--type A|CNAME|MX|TXT|...] [--name <name>] [--proxied]
cloudflare-cli dns get <zone-id> <record-id>
cloudflare-cli dns create <zone-id> --type A --name @ --content 1.2.3.4 [--ttl <seconds>] [--proxied] [--priority <n>]
cloudflare-cli dns update <zone-id> <record-id> # type changes require delete + create
cloudflare-cli dns delete <zone-id> <record-id>
cloudflare-cli dns export <zone-id>
cloudflare-cli dns import <zone-id>
cloudflare-cli dns scan <zone-id>
cloudflare-cli dns scan-results <zone-id>
cloudflare-cli dns scan-review <zone-id> [--accepts '<record-array>'] [--rejects '<id-array>']
```

### accounts

Manage Cloudflare accounts.

```bash
cloudflare-cli accounts list
cloudflare-cli accounts get <account-id>
cloudflare-cli accounts members <account-id>
cloudflare-cli accounts member-get <account-id> <member-id>
cloudflare-cli accounts member-remove <account-id> <member-id>
cloudflare-cli accounts roles <account-id> # lists IAM permission groups
```

### settings

Manage zone settings (minify, polish, mirage, HTTP/2, HTTP/3, etc.).

```bash
cloudflare-cli settings list <zone-id>
cloudflare-cli settings get <zone-id> <setting-name>
cloudflare-cli settings set <zone-id> <setting-name>
cloudflare-cli settings batch-set <zone-id>
```

### workers

Manage Workers scripts, routes, and cron triggers.

```bash
cloudflare-cli workers list <account-id>
cloudflare-cli workers get <account-id> <script-name> [--file <path>]
cloudflare-cli workers delete <account-id> <script-name>
cloudflare-cli workers tail <account-id> <script-name>
cloudflare-cli workers routes <zone-id>
cloudflare-cli workers create-route <zone-id>
cloudflare-cli workers delete-route <zone-id> <route-id>
cloudflare-cli workers crons <account-id> <script-name>
cloudflare-cli workers update-crons <account-id> <script-name>
cloudflare-cli workers secrets <account-id> <script-name>
cloudflare-cli workers put-secret <account-id> <script-name>
cloudflare-cli workers delete-secret <account-id> <script-name> <secret-name>
cloudflare-cli workers domains <account-id>
cloudflare-cli workers subdomains <account-id>
```

### kv

Manage Workers KV namespaces and key-value pairs.

```bash
cloudflare-cli kv list <account-id>
cloudflare-cli kv create <account-id>
cloudflare-cli kv delete <account-id> <namespace-id>
cloudflare-cli kv rename <account-id> <namespace-id>
cloudflare-cli kv keys <account-id> <namespace-id>
cloudflare-cli kv get-value <account-id> <namespace-id> <key-name>
cloudflare-cli kv put-value <account-id> <namespace-id> <key-name> --value <value> [--expiration <timestamp>] [--expiration-ttl <ttl>]
cloudflare-cli kv delete-value <account-id> <namespace-id> <key-name>
cloudflare-cli kv bulk-write <account-id> <namespace-id>
cloudflare-cli kv bulk-delete <account-id> <namespace-id> --keys '["key-1","key-2"]'
```

### d1

Manage D1 databases.

```bash
cloudflare-cli d1 list <account-id>
cloudflare-cli d1 get <account-id> <database-id>
cloudflare-cli d1 create <account-id>
cloudflare-cli d1 delete <account-id> <database-id>
cloudflare-cli d1 query <account-id> <database-id> --sql "SELECT * FROM users" [--params '<json>']
cloudflare-cli d1 raw <account-id> <database-id>
```

### r2

Manage R2 storage buckets.

```bash
cloudflare-cli r2 list <account-id>
cloudflare-cli r2 get <account-id> <bucket-name>
cloudflare-cli r2 create <account-id>
cloudflare-cli r2 delete <account-id> <bucket-name>
```

### pages

Manage Pages projects and deployments.

```bash
cloudflare-cli pages list <account-id>
cloudflare-cli pages get <account-id> <project-name>
cloudflare-cli pages create <account-id>
cloudflare-cli pages delete <account-id> <project-name>
cloudflare-cli pages deployments <account-id> <project-name>
cloudflare-cli pages deployment-get <account-id> <project-name> <deployment-id>
cloudflare-cli pages deployment-delete <account-id> <project-name> <deployment-id>
cloudflare-cli pages deployment-retry <account-id> <project-name> <deployment-id>
cloudflare-cli pages deployment-rollback <account-id> <project-name> <deployment-id>
cloudflare-cli pages domains <account-id> <project-name>
cloudflare-cli pages add-domain <account-id> <project-name>
cloudflare-cli pages delete-domain <account-id> <project-name> <domain-name>
```

### queues

Manage Cloudflare Queues.

```bash
cloudflare-cli queues list <account-id>
cloudflare-cli queues get <account-id> <queue-id>
cloudflare-cli queues create <account-id>
cloudflare-cli queues delete <account-id> <queue-id>
cloudflare-cli queues update <account-id> <queue-id>
cloudflare-cli queues consumers <account-id> <queue-id>
cloudflare-cli queues add-consumer <account-id> <queue-id>
cloudflare-cli queues delete-consumer <account-id> <queue-id> <consumer-id>
```

### tunnels

Manage Cloudflare Tunnels.

```bash
cloudflare-cli tunnels list <account-id>
cloudflare-cli tunnels get <account-id> <tunnel-id>
cloudflare-cli tunnels create <account-id>
cloudflare-cli tunnels delete <account-id> <tunnel-id>
cloudflare-cli tunnels configs <account-id> <tunnel-id>
cloudflare-cli tunnels update-config <account-id> <tunnel-id>
cloudflare-cli tunnels connections <account-id> <tunnel-id>
cloudflare-cli tunnels clean-connections <account-id> <tunnel-id>
cloudflare-cli tunnels token <account-id> <tunnel-id>
```

### ssl

Manage SSL/TLS certificates and settings.

```bash
cloudflare-cli ssl mode <zone-id>
cloudflare-cli ssl set-mode <zone-id>
cloudflare-cli ssl universal <zone-id>
cloudflare-cli ssl set-universal <zone-id>
cloudflare-cli ssl certificate-packs <zone-id>
cloudflare-cli ssl order-pack <zone-id>
cloudflare-cli ssl delete-pack <zone-id> <pack-id>
cloudflare-cli ssl tls-versions <zone-id>
cloudflare-cli ssl set-tls-version <zone-id>
cloudflare-cli ssl always-https <zone-id>
cloudflare-cli ssl set-always-https <zone-id>
cloudflare-cli ssl origin-certs
cloudflare-cli ssl create-origin-cert
cloudflare-cli ssl revoke-origin-cert <cert-id>
```

### custom-hostnames

Manage custom hostnames for SSL for SaaS.

```bash
cloudflare-cli custom-hostnames list <zone-id>
cloudflare-cli custom-hostnames get <zone-id> <hostname-id>
cloudflare-cli custom-hostnames create <zone-id>
cloudflare-cli custom-hostnames update <zone-id> <hostname-id>
cloudflare-cli custom-hostnames delete <zone-id> <hostname-id>
cloudflare-cli custom-hostnames fallback <zone-id>
cloudflare-cli custom-hostnames set-fallback <zone-id>
cloudflare-cli custom-hostnames delete-fallback <zone-id>
```

### load-balancers

Manage load balancers, pools, and monitors.

```bash
cloudflare-cli load-balancers list <zone-id>
cloudflare-cli load-balancers get <zone-id> <lb-id>
cloudflare-cli load-balancers create <zone-id>
cloudflare-cli load-balancers update <zone-id> <lb-id>
cloudflare-cli load-balancers delete <zone-id> <lb-id>
cloudflare-cli load-balancers pools <account-id>
cloudflare-cli load-balancers pool-get <account-id> <pool-id>
cloudflare-cli load-balancers pool-create <account-id>
cloudflare-cli load-balancers pool-delete <account-id> <pool-id>
cloudflare-cli load-balancers monitors <account-id>
cloudflare-cli load-balancers monitor-get <account-id> <monitor-id>
cloudflare-cli load-balancers monitor-create <account-id>
cloudflare-cli load-balancers monitor-delete <account-id> <monitor-id>
```

### argo

Manage Argo Smart Routing and Tiered Caching.

```bash
cloudflare-cli argo smart-routing <zone-id>
cloudflare-cli argo set-smart-routing <zone-id>
cloudflare-cli argo tiered-caching <zone-id>
cloudflare-cli argo set-tiered-caching <zone-id>
```

### spectrum

Manage Spectrum applications for TCP/UDP proxying.

```bash
cloudflare-cli spectrum list <zone-id>
cloudflare-cli spectrum get <zone-id> <app-id>
cloudflare-cli spectrum create <zone-id>
cloudflare-cli spectrum update <zone-id> <app-id>
cloudflare-cli spectrum delete <zone-id> <app-id>
```

### security

Manage zone security settings.

```bash
cloudflare-cli security get-level <zone-id>
cloudflare-cli security set-level <zone-id>
cloudflare-cli security challenge-ttl <zone-id>
cloudflare-cli security set-challenge-ttl <zone-id>
cloudflare-cli security browser-check <zone-id>
cloudflare-cli security set-browser-check <zone-id>
```

### waf

Manage WAF rulesets and custom rules.

```bash
cloudflare-cli waf rulesets <zone-id>
cloudflare-cli waf ruleset-get <zone-id> <ruleset-id>
cloudflare-cli waf ruleset-delete <zone-id> <ruleset-id>
cloudflare-cli waf phase-get <zone-id> <phase>
cloudflare-cli waf create-rule <zone-id> <ruleset-id>
cloudflare-cli waf update-rule <zone-id> <ruleset-id> <rule-id>
cloudflare-cli waf delete-rule <zone-id> <ruleset-id> <rule-id>
```

### firewall

Manage IP access rules and firewall settings.

```bash
cloudflare-cli firewall ip-rules <zone-id>
cloudflare-cli firewall ip-rule-create <zone-id>
cloudflare-cli firewall ip-rule-update <zone-id> <rule-id>
cloudflare-cli firewall ip-rule-delete <zone-id> <rule-id>
cloudflare-cli firewall account-ip-rules <account-id>
cloudflare-cli firewall account-ip-rule-create <account-id>
cloudflare-cli firewall account-ip-rule-delete <account-id> <rule-id>
cloudflare-cli firewall ua-rules <zone-id>
cloudflare-cli firewall ua-rule-create <zone-id>
cloudflare-cli firewall ua-rule-delete <zone-id> <rule-id>
```

### bot

Manage bot management settings.

```bash
cloudflare-cli bot get <zone-id>
cloudflare-cli bot update <zone-id>
```

### rate-limits

Manage rate limiting rules through Cloudflare's Rulesets API (`http_ratelimit`).

```bash
cloudflare-cli rate-limits list <zone-id>
cloudflare-cli rate-limits get <zone-id> <rule-id>
cloudflare-cli rate-limits create <zone-id> --threshold 100 --period 60 [--expression '<rules-expression>']
cloudflare-cli rate-limits update <zone-id> <rule-id>
cloudflare-cli rate-limits delete <zone-id> <rule-id>
```

### access

Manage Zero Trust Access applications, policies, and groups.

```bash
cloudflare-cli access apps <account-id>
cloudflare-cli access app-get <account-id> <app-id>
cloudflare-cli access app-create <account-id>
cloudflare-cli access app-update <account-id> <app-id>
cloudflare-cli access app-delete <account-id> <app-id>
cloudflare-cli access policies <account-id> <app-id>
cloudflare-cli access policy-create <account-id> <app-id>
cloudflare-cli access policy-delete <account-id> <app-id> <policy-id>
cloudflare-cli access groups <account-id>
cloudflare-cli access group-get <account-id> <group-id>
cloudflare-cli access group-create <account-id>
cloudflare-cli access group-delete <account-id> <group-id>
cloudflare-cli access idps <account-id>
cloudflare-cli access service-tokens <account-id>
cloudflare-cli access service-token-create <account-id>
cloudflare-cli access service-token-delete <account-id> <token-id>
```

### rules

Manage Origin, Transform, Redirect, and Configuration rules via rulesets phases.

```bash
cloudflare-cli rules origin <zone-id>
cloudflare-cli rules transform <zone-id>
cloudflare-cli rules url-rewrite <zone-id>
cloudflare-cli rules redirect <zone-id>
cloudflare-cli rules bulk-redirect <account-id>
cloudflare-cli rules config <zone-id>
cloudflare-cli rules cache-rules <zone-id>
cloudflare-cli rules update-phase <zone-id> <phase>
cloudflare-cli rules list-phases <zone-id>
```

### page-rules

Manage page rules.

```bash
cloudflare-cli page-rules list <zone-id>
cloudflare-cli page-rules get <zone-id> <rule-id>
cloudflare-cli page-rules create <zone-id>
cloudflare-cli page-rules update <zone-id> <rule-id>
cloudflare-cli page-rules delete <zone-id> <rule-id>
```

### cache

Manage cache settings and purge.

```bash
cloudflare-cli cache purge <zone-id> --everything
cloudflare-cli cache purge <zone-id> --files "https://example.com/style.css,https://example.com/app.js"
cloudflare-cli cache purge <zone-id> --tags "tag1,tag2"
cloudflare-cli cache level <zone-id>
cloudflare-cli cache set-level <zone-id>
cloudflare-cli cache ttl <zone-id>
cloudflare-cli cache set-ttl <zone-id>
cloudflare-cli cache dev-mode <zone-id>
cloudflare-cli cache set-dev-mode <zone-id>
```

### email-routing

Manage email routing rules and addresses.

```bash
cloudflare-cli email-routing status <zone-id>
cloudflare-cli email-routing enable <zone-id>
cloudflare-cli email-routing disable <zone-id>
cloudflare-cli email-routing rules <zone-id>
cloudflare-cli email-routing rule-get <zone-id> <rule-id>
cloudflare-cli email-routing rule-create <zone-id>
cloudflare-cli email-routing rule-update <zone-id> <rule-id>
cloudflare-cli email-routing rule-delete <zone-id> <rule-id>
cloudflare-cli email-routing addresses <account-id>
cloudflare-cli email-routing address-create <account-id>
cloudflare-cli email-routing address-delete <account-id> <address-id>
cloudflare-cli email-routing catch-all <zone-id>
cloudflare-cli email-routing set-catch-all <zone-id>
```

### dnssec

Manage DNSSEC settings.

```bash
cloudflare-cli dnssec get <zone-id>
cloudflare-cli dnssec enable <zone-id>
cloudflare-cli dnssec disable <zone-id>
```

### waiting-room

Manage waiting rooms.

```bash
cloudflare-cli waiting-room list <zone-id>
cloudflare-cli waiting-room get <zone-id> <wr-id>
cloudflare-cli waiting-room create <zone-id>
cloudflare-cli waiting-room update <zone-id> <wr-id>
cloudflare-cli waiting-room delete <zone-id> <wr-id>
cloudflare-cli waiting-room status <zone-id> <wr-id>
```

### analytics

View zone analytics and GraphQL queries.

```bash
cloudflare-cli analytics dashboard <zone-id>
cloudflare-cli analytics colos <zone-id>
cloudflare-cli analytics graphql
```

### logs

Manage Logpush jobs and instant logs.

```bash
cloudflare-cli logs jobs <zone-id>
cloudflare-cli logs job-get <zone-id> <job-id>
cloudflare-cli logs job-create <zone-id>
cloudflare-cli logs job-update <zone-id> <job-id>
cloudflare-cli logs job-delete <zone-id> <job-id>
cloudflare-cli logs datasets <zone-id> <dataset-name>
cloudflare-cli logs account-jobs <account-id>
```

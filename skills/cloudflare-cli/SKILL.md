---
name: cloudflare-cli
description: "Manage Cloudflare via CLI - zones, dns, workers, kv, d1, r2, pages, queues, tunnels, ssl, waf, firewall, bot, rate-limits, security, access, cache, page-rules, email-routing, dnssec, waiting-room, analytics, logs, rules, settings, accounts, argo, spectrum, custom-hostnames, load-balancers. Use when user mentions 'cloudflare', 'DNS records', 'workers', 'KV', 'D1 database', 'R2 bucket', 'pages deploy', 'tunnel', 'SSL certificate', 'WAF rule', 'firewall rule', 'bot management', 'rate limit', 'security level', 'zero trust', 'access policy', 'cache purge', 'page rules', 'email routing', 'DNSSEC', 'waiting room', 'logpush', 'origin rules', 'load balancer', 'spectrum', 'custom hostname', or 'argo'."
category: devtools
---

# cloudflare-cli

## Setup

If `cloudflare-cli` is not found, install and build it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle cloudflare
npx api2cli link cloudflare
```

`api2cli link` adds `~/.local/bin` to PATH automatically. The CLI is available in the next command.

Always use `--json` flag when calling commands programmatically.

## Authentication

```bash
cloudflare-cli auth set "your-token"
cloudflare-cli auth test
cloudflare-cli auth test --account-id <account-id>
```

Auth commands: `auth set <token>`, `auth show`, `auth remove`, `auth test`

Token is stored in `~/.config/tokens/cloudflare-cli.txt`.

## Resources

### zones - Manage Cloudflare zones

| Command | Description |
|---------|-------------|
| `cloudflare-cli zones list --json` | List all zones |
| `cloudflare-cli zones list --name example.com --json` | Filter by domain |
| `cloudflare-cli zones get <zone-id> --json` | Get zone details |
| `cloudflare-cli zones create --name example.com --json` | Create zone |
| `cloudflare-cli zones delete <zone-id> --json` | Delete zone |
| `cloudflare-cli zones purge <zone-id> --everything --json` | Purge all cache |
| `cloudflare-cli zones purge <zone-id> --files "url1,url2" --json` | Purge specific URLs |
| `cloudflare-cli zones settings <zone-id> --json` | List all zone settings |
| `cloudflare-cli zones set-setting <zone-id> <setting> --value "val" --json` | Update setting |
| `cloudflare-cli zones activate-check <zone-id> --json` | Trigger activation check |

### dns - Manage DNS records

| Command | Description |
|---------|-------------|
| `cloudflare-cli dns list <zone-id> --json` | List all DNS records |
| `cloudflare-cli dns list <zone-id> --type CNAME --json` | Filter by type |
| `cloudflare-cli dns get <zone-id> <record-id> --json` | Get record |
| `cloudflare-cli dns create <zone-id> --type A --name @ --content 1.2.3.4 --json` | Create A record |
| `cloudflare-cli dns create <zone-id> --type CNAME --name www --content example.com --proxied --json` | Create proxied CNAME |
| `cloudflare-cli dns update <zone-id> <record-id> --content 5.6.7.8 --json` | Update record |
| `cloudflare-cli dns delete <zone-id> <record-id> --json` | Delete record |
| `cloudflare-cli dns export <zone-id>` | Export as BIND format |
| `cloudflare-cli dns scan <zone-id> --json` | Trigger asynchronous DNS scan |
| `cloudflare-cli dns scan-results <zone-id> --json` | List discovered records |
| `cloudflare-cli dns scan-review <zone-id> --accepts '[...]' --rejects '["id"]' --json` | Accept or reject scanned records |

### accounts - Manage accounts

| Command | Description |
|---------|-------------|
| `cloudflare-cli accounts list --json` | List accounts |
| `cloudflare-cli accounts get <account-id> --json` | Get account |
| `cloudflare-cli accounts members <account-id> --json` | List members |
| `cloudflare-cli accounts roles <account-id> --json` | List IAM permission groups |

### settings - Zone settings

| Command | Description |
|---------|-------------|
| `cloudflare-cli settings list <zone-id> --json` | List all settings |
| `cloudflare-cli settings get <zone-id> always_use_https --json` | Get setting |
| `cloudflare-cli settings set <zone-id> min_tls_version --value "1.2" --json` | Set setting |
| `cloudflare-cli settings batch-set <zone-id> --items '[{"id":"always_use_https","value":"on"}]' --json` | Batch update |

### workers - Workers scripts, routes, crons, secrets

| Command | Description |
|---------|-------------|
| `cloudflare-cli workers list <account-id> --json` | List scripts |
| `cloudflare-cli workers get <account-id> <script> [--file <path>]` | Download script |
| `cloudflare-cli workers delete <account-id> <script> --json` | Delete script |
| `cloudflare-cli workers routes <zone-id> --json` | List routes |
| `cloudflare-cli workers create-route <zone-id> --pattern "*.example.com/*" --script my-worker --json` | Create route |
| `cloudflare-cli workers crons <account-id> <script> --json` | List cron triggers |
| `cloudflare-cli workers secrets <account-id> <script> --json` | List secrets |
| `cloudflare-cli workers put-secret <account-id> <script> --name KEY --text value --json` | Set secret |
| `cloudflare-cli workers delete-secret <account-id> <script> <secret> --json` | Delete secret |
| `cloudflare-cli workers domains <account-id> --json` | List custom domains |

### kv - Workers KV namespaces and key-value pairs

| Command | Description |
|---------|-------------|
| `cloudflare-cli kv list <account-id> --json` | List namespaces |
| `cloudflare-cli kv create <account-id> --title "My KV" --json` | Create namespace |
| `cloudflare-cli kv delete <account-id> <ns-id> --json` | Delete namespace |
| `cloudflare-cli kv keys <account-id> <ns-id> --json` | List keys |
| `cloudflare-cli kv get-value <account-id> <ns-id> <key>` | Get value |
| `cloudflare-cli kv put-value <account-id> <ns-id> <key> --value "data" --json` | Set value |
| `cloudflare-cli kv delete-value <account-id> <ns-id> <key> --json` | Delete value |
| `cloudflare-cli kv bulk-write <account-id> <ns-id> --data '[{"key":"k","value":"v"}]' --json` | Bulk write |
| `cloudflare-cli kv bulk-delete <account-id> <ns-id> --keys '["k"]' --json` | Bulk delete |

### d1 - D1 databases

| Command | Description |
|---------|-------------|
| `cloudflare-cli d1 list <account-id> --json` | List databases |
| `cloudflare-cli d1 create <account-id> --name mydb --json` | Create database |
| `cloudflare-cli d1 get <account-id> <db-id> --json` | Get database |
| `cloudflare-cli d1 delete <account-id> <db-id> --json` | Delete database |
| `cloudflare-cli d1 query <account-id> <db-id> --sql "SELECT * FROM users" --json` | Run query |

### r2 - R2 storage buckets

| Command | Description |
|---------|-------------|
| `cloudflare-cli r2 list <account-id> --json` | List buckets |
| `cloudflare-cli r2 list <account-id> --name-contains assets --json` | Filter buckets by name |
| `cloudflare-cli r2 create <account-id> --name my-bucket --json` | Create bucket |
| `cloudflare-cli r2 get <account-id> <bucket> --json` | Get bucket |
| `cloudflare-cli r2 delete <account-id> <bucket> --json` | Delete bucket |

### pages - Pages projects and deployments

| Command | Description |
|---------|-------------|
| `cloudflare-cli pages list <account-id> --json` | List projects |
| `cloudflare-cli pages create <account-id> --name my-site --json` | Create project |
| `cloudflare-cli pages deployments <account-id> <project> --json` | List deployments |
| `cloudflare-cli pages deployment-rollback <account-id> <project> <deploy-id> --json` | Rollback |
| `cloudflare-cli pages domains <account-id> <project> --json` | List custom domains |
| `cloudflare-cli pages add-domain <account-id> <project> --name custom.example.com --json` | Add domain |

### queues - Cloudflare Queues

| Command | Description |
|---------|-------------|
| `cloudflare-cli queues list <account-id> --json` | List queues |
| `cloudflare-cli queues create <account-id> --name my-queue --json` | Create queue |
| `cloudflare-cli queues consumers <account-id> <queue-id> --json` | List consumers |
| `cloudflare-cli queues add-consumer <account-id> <queue-id> --script-name worker --json` | Add consumer |

### tunnels - Cloudflare Tunnels

| Command | Description |
|---------|-------------|
| `cloudflare-cli tunnels list <account-id> --json` | List tunnels |
| `cloudflare-cli tunnels get <account-id> <tunnel-id> --json` | Get tunnel |
| `cloudflare-cli tunnels create <account-id> --name my-tunnel --tunnel-secret <b64> --json` | Create tunnel |
| `cloudflare-cli tunnels delete <account-id> <tunnel-id> --json` | Delete tunnel |
| `cloudflare-cli tunnels configs <account-id> <tunnel-id> --json` | Get config |
| `cloudflare-cli tunnels update-config <account-id> <tunnel-id> --config '{}' --json` | Update config |
| `cloudflare-cli tunnels connections <account-id> <tunnel-id> --json` | List connections |
| `cloudflare-cli tunnels token <account-id> <tunnel-id> --json` | Get token |

### ssl - SSL/TLS certificates and settings

| Command | Description |
|---------|-------------|
| `cloudflare-cli ssl mode <zone-id> --json` | Get SSL mode |
| `cloudflare-cli ssl set-mode <zone-id> --value strict --json` | Set SSL mode |
| `cloudflare-cli ssl universal <zone-id> --json` | Universal SSL settings |
| `cloudflare-cli ssl certificate-packs <zone-id> --json` | List certificate packs |
| `cloudflare-cli ssl tls-versions <zone-id> --json` | Get min TLS version |
| `cloudflare-cli ssl set-tls-version <zone-id> --value 1.2 --json` | Set min TLS |
| `cloudflare-cli ssl always-https <zone-id> --json` | Get always HTTPS |
| `cloudflare-cli ssl set-always-https <zone-id> --value on --json` | Enable always HTTPS |
| `cloudflare-cli ssl origin-certs --json` | List origin certificates |

### waf - WAF rulesets and custom rules

| Command | Description |
|---------|-------------|
| `cloudflare-cli waf rulesets <zone-id> --json` | List rulesets |
| `cloudflare-cli waf ruleset-get <zone-id> <ruleset-id> --json` | Get ruleset |
| `cloudflare-cli waf phase-get <zone-id> http_request_firewall_custom --json` | Get phase entrypoint |
| `cloudflare-cli waf create-rule <zone-id> <ruleset-id> --action block --expression "(ip.src eq 1.2.3.4)" --json` | Create rule |
| `cloudflare-cli waf delete-rule <zone-id> <ruleset-id> <rule-id> --json` | Delete rule |

### firewall - IP access rules and user agent rules

| Command | Description |
|---------|-------------|
| `cloudflare-cli firewall ip-rules <zone-id> --json` | List IP access rules |
| `cloudflare-cli firewall ip-rule-create <zone-id> --mode block --target-type ip --target-value 1.2.3.4 --json` | Block IP |
| `cloudflare-cli firewall ip-rule-create <zone-id> --mode block --target-type country --target-value CN --json` | Block country |
| `cloudflare-cli firewall ip-rule-delete <zone-id> <rule-id> --json` | Delete rule |
| `cloudflare-cli firewall ua-rules <zone-id> --json` | List UA rules |
| `cloudflare-cli firewall ua-rule-create <zone-id> --mode block --ua-value "BadBot" --json` | Block user agent |

### bot - Bot management

| Command | Description |
|---------|-------------|
| `cloudflare-cli bot get <zone-id> --json` | Get bot settings |
| `cloudflare-cli bot update <zone-id> --fight-mode --json` | Enable bot fight mode |
| `cloudflare-cli bot update <zone-id> --no-fight-mode --json` | Disable bot fight mode |

### rate-limits - Rate limiting rules

| Command | Description |
|---------|-------------|
| `cloudflare-cli rate-limits list <zone-id> --json` | List rules |
| `cloudflare-cli rate-limits create <zone-id> --threshold 100 --period 60 --action-mode block --action-timeout 3600 --json` | Create Rulesets-based rule |
| `cloudflare-cli rate-limits delete <zone-id> <rule-id> --json` | Delete rule |

### security - Zone security settings

| Command | Description |
|---------|-------------|
| `cloudflare-cli security get-level <zone-id> --json` | Get security level |
| `cloudflare-cli security set-level <zone-id> --value high --json` | Set security level |
| `cloudflare-cli security set-level <zone-id> --value under_attack --json` | Enable Under Attack mode |
| `cloudflare-cli security challenge-ttl <zone-id> --json` | Get challenge TTL |
| `cloudflare-cli security browser-check <zone-id> --json` | Get browser check |

### access - Zero Trust Access

| Command | Description |
|---------|-------------|
| `cloudflare-cli access apps <account-id> --json` | List Access apps |
| `cloudflare-cli access app-create <account-id> --name "My App" --domain app.example.com --type self_hosted --json` | Create app |
| `cloudflare-cli access policies <account-id> <app-id> --json` | List policies |
| `cloudflare-cli access groups <account-id> --json` | List groups |
| `cloudflare-cli access service-tokens <account-id> --json` | List service tokens |
| `cloudflare-cli access idps <account-id> --json` | List identity providers |

### rules - Origin, Transform, Redirect, Config, Cache rules

| Command | Description |
|---------|-------------|
| `cloudflare-cli rules list-phases <zone-id> --json` | List all rulesets |
| `cloudflare-cli rules origin <zone-id> --json` | Get origin rules |
| `cloudflare-cli rules transform <zone-id> --json` | Get transform rules |
| `cloudflare-cli rules redirect <zone-id> --json` | Get redirect rules |
| `cloudflare-cli rules cache-rules <zone-id> --json` | Get cache rules |
| `cloudflare-cli rules config <zone-id> --json` | Get config rules |
| `cloudflare-cli rules update-phase <zone-id> <phase> --rules '[...]' --json` | Update phase rules |

### cache - Cache settings and purge

| Command | Description |
|---------|-------------|
| `cloudflare-cli cache purge <zone-id> --everything --json` | Purge all |
| `cloudflare-cli cache purge <zone-id> --files "url1,url2" --json` | Purge files |
| `cloudflare-cli cache level <zone-id> --json` | Get cache level |
| `cloudflare-cli cache set-level <zone-id> --value aggressive --json` | Set cache level |
| `cloudflare-cli cache dev-mode <zone-id> --json` | Get dev mode |
| `cloudflare-cli cache set-dev-mode <zone-id> --value on --json` | Enable dev mode |

### page-rules - Page rules

| Command | Description |
|---------|-------------|
| `cloudflare-cli page-rules list <zone-id> --json` | List page rules |
| `cloudflare-cli page-rules create <zone-id> --url "*.example.com/*" --actions '[...]' --json` | Create rule |
| `cloudflare-cli page-rules delete <zone-id> <rule-id> --json` | Delete rule |

### email-routing - Email routing

| Command | Description |
|---------|-------------|
| `cloudflare-cli email-routing status <zone-id> --json` | Get routing status |
| `cloudflare-cli email-routing enable <zone-id> --json` | Enable routing |
| `cloudflare-cli email-routing rules <zone-id> --json` | List rules |
| `cloudflare-cli email-routing rule-create <zone-id> --matchers '[...]' --actions '[...]' --json` | Create rule |
| `cloudflare-cli email-routing addresses <account-id> --json` | List addresses |
| `cloudflare-cli email-routing catch-all <zone-id> --json` | Get catch-all |

### dnssec - DNSSEC settings

| Command | Description |
|---------|-------------|
| `cloudflare-cli dnssec get <zone-id> --json` | Get DNSSEC status |
| `cloudflare-cli dnssec enable <zone-id> --json` | Enable DNSSEC |
| `cloudflare-cli dnssec disable <zone-id> --json` | Disable DNSSEC |

### waiting-room - Waiting rooms

| Command | Description |
|---------|-------------|
| `cloudflare-cli waiting-room list <zone-id> --json` | List waiting rooms |
| `cloudflare-cli waiting-room create <zone-id> --name "Queue" --host example.com --total-active-users 200 --new-users-per-minute 100 --json` | Create |
| `cloudflare-cli waiting-room status <zone-id> <wr-id> --json` | Check status |

### analytics - Zone analytics and GraphQL

| Command | Description |
|---------|-------------|
| `cloudflare-cli analytics dashboard <zone-id> --json` | Get dashboard analytics |
| `cloudflare-cli analytics colos <zone-id> --json` | Get colo analytics |
| `cloudflare-cli analytics graphql --query "{ viewer { ... } }" --json` | Execute GraphQL |

### logs - Logpush jobs

| Command | Description |
|---------|-------------|
| `cloudflare-cli logs jobs <zone-id> --json` | List logpush jobs |
| `cloudflare-cli logs job-create <zone-id> --destination-conf "s3://..." --dataset http_requests --json` | Create job |
| `cloudflare-cli logs datasets <zone-id> http_requests --json` | List fields |
| `cloudflare-cli logs account-jobs <account-id> --json` | List account jobs |

### argo - Smart Routing and Tiered Caching

| Command | Description |
|---------|-------------|
| `cloudflare-cli argo smart-routing <zone-id> --json` | Get smart routing |
| `cloudflare-cli argo set-smart-routing <zone-id> --value on --json` | Enable |
| `cloudflare-cli argo tiered-caching <zone-id> --json` | Get tiered caching |
| `cloudflare-cli argo set-tiered-caching <zone-id> --value on --json` | Enable |

### spectrum - TCP/UDP proxying

| Command | Description |
|---------|-------------|
| `cloudflare-cli spectrum list <zone-id> --json` | List apps |
| `cloudflare-cli spectrum create <zone-id> --protocol tcp/443 --dns-type CNAME --dns-name proxy --origin-dns-name origin.example.com --json` | Create |
| `cloudflare-cli spectrum delete <zone-id> <app-id> --json` | Delete |

### custom-hostnames - SSL for SaaS

| Command | Description |
|---------|-------------|
| `cloudflare-cli custom-hostnames list <zone-id> --json` | List hostnames |
| `cloudflare-cli custom-hostnames create <zone-id> --hostname app.customer.com --json` | Create |
| `cloudflare-cli custom-hostnames fallback <zone-id> --json` | Get fallback origin |
| `cloudflare-cli custom-hostnames set-fallback <zone-id> --origin fallback.example.com --json` | Set fallback |

### load-balancers - Load balancers, pools, monitors

| Command | Description |
|---------|-------------|
| `cloudflare-cli load-balancers list <zone-id> --json` | List LBs |
| `cloudflare-cli load-balancers create <zone-id> --name lb.example.com --default-pools "pool1,pool2" --json` | Create LB |
| `cloudflare-cli load-balancers pools <account-id> --json` | List pools |
| `cloudflare-cli load-balancers pool-create <account-id> --name "Pool 1" --origins '[{"name":"o1","address":"1.2.3.4"}]' --json` | Create pool |
| `cloudflare-cli load-balancers monitors <account-id> --json` | List monitors |
| `cloudflare-cli load-balancers monitor-create <account-id> --type https --json` | Create monitor |

## Output Format

`--json` returns a standardized envelope:
```json
{ "ok": true, "data": { ... }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "code": 401 } }`

## Quick Reference

```bash
cloudflare-cli --help                    # List all resources and global flags
cloudflare-cli <resource> --help         # List all actions for a resource
cloudflare-cli <resource> <action> --help # Show flags for a specific action
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: 0 = success, 1 = API error, 2 = usage error

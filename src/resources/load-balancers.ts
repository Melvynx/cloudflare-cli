import { Command } from 'commander';
import { client } from '../lib/client';
import { output } from '../lib/output';
import { handleError } from '../lib/errors';

export const loadBalancersResource = new Command('load-balancers')
  .description('Manage load balancers, pools, and monitors');

loadBalancersResource
  .command('list <zone-id>')
  .option('--fields <fields>', 'Comma-separated fields')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (zoneId, options) => {
    try {
      const params = new URLSearchParams();
      if (options.fields) params.append('fields', options.fields);
      const query = params.toString();
      const url = `/zones/${zoneId}/load_balancers${query ? '?' + query : ''}`;
      const data = await client.get(url);
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('get <zone-id> <lb-id>')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (zoneId, lbId, options) => {
    try {
      const data = await client.get(`/zones/${zoneId}/load_balancers/${lbId}`);
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('create <zone-id>')
  .requiredOption('--name <name>', 'Hostname')
  .requiredOption('--default-pools <pools>', 'Comma-separated pool IDs')
  .option('--fallback-pool <pool>', 'Fallback pool ID')
  .option('--proxied', 'Enable proxied')
  .option('--ttl <ttl>', 'TTL (default 30)')
  .option(
    '--steering-policy <policy>',
    'Steering policy (off|geo|random|dynamic_latency|proximity|least_outstanding_requests|least_connections)'
  )
  .option('--json', 'Output as JSON')
  .action(async (zoneId, options) => {
    try {
      const body: any = {
        name: options.name,
        default_pools: options.defaultPools
          .split(',')
          .map((p: string) => p.trim()),
      };
      if (options.fallbackPool) body.fallback_pool = options.fallbackPool;
      if (options.proxied) body.proxied = true;
      if (options.ttl) body.ttl = parseInt(options.ttl);
      if (options.steeringPolicy) body.steering_policy = options.steeringPolicy;
      const data = await client.post(`/zones/${zoneId}/load_balancers`, body);
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('update <zone-id> <lb-id>')
  .option('--name <name>', 'Hostname')
  .option('--default-pools <pools>', 'Comma-separated pool IDs')
  .option('--fallback-pool <pool>', 'Fallback pool ID')
  .option('--proxied', 'Enable proxied')
  .option('--no-proxied', 'Disable proxied')
  .option('--ttl <ttl>', 'TTL')
  .option('--steering-policy <policy>', 'Steering policy')
  .option('--enabled', 'Enable load balancer')
  .option('--disabled', 'Disable load balancer')
  .option('--json', 'Output as JSON')
  .action(async (zoneId, lbId, options) => {
    try {
      const body: any = {};
      if (options.name) body.name = options.name;
      if (options.defaultPools)
        body.default_pools = options.defaultPools
          .split(',')
          .map((p: string) => p.trim());
      if (options.fallbackPool) body.fallback_pool = options.fallbackPool;
      if (options.proxied !== undefined) body.proxied = options.proxied;
      if (options.ttl) body.ttl = parseInt(options.ttl);
      if (options.steeringPolicy) body.steering_policy = options.steeringPolicy;
      if (options.enabled !== undefined) body.enabled = options.enabled;
      if (options.disabled) body.enabled = false;
      const data = await client.patch(
        `/zones/${zoneId}/load_balancers/${lbId}`,
        body
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('delete <zone-id> <lb-id>')
  .option('--json', 'Output as JSON')
  .action(async (zoneId, lbId, options) => {
    try {
      const data = await client.delete(
        `/zones/${zoneId}/load_balancers/${lbId}`
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('pools <account-id>')
  .option('--fields <fields>', 'Comma-separated fields')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (accountId, options) => {
    try {
      const params = new URLSearchParams();
      if (options.fields) params.append('fields', options.fields);
      const query = params.toString();
      const url = `/accounts/${accountId}/load_balancers/pools${
        query ? '?' + query : ''
      }`;
      const data = await client.get(url);
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('pool-get <account-id> <pool-id>')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (accountId, poolId, options) => {
    try {
      const data = await client.get(
        `/accounts/${accountId}/load_balancers/pools/${poolId}`
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('pool-create <account-id>')
  .requiredOption('--name <name>', 'Pool name')
  .requiredOption('--origins <origins>', 'JSON array of origin objects')
  .option('--monitor <monitor>', 'Monitor ID')
  .option('--notification-email <email>', 'Notification email')
  .option('--enabled', 'Enable pool (default true)')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    try {
      const body: any = {
        name: options.name,
        origins: JSON.parse(options.origins),
      };
      if (options.monitor) body.monitor = options.monitor;
      if (options.notificationEmail)
        body.notification_email = options.notificationEmail;
      if (options.enabled !== undefined) body.enabled = options.enabled;
      const data = await client.post(
        `/accounts/${accountId}/load_balancers/pools`,
        body
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('pool-delete <account-id> <pool-id>')
  .option('--json', 'Output as JSON')
  .action(async (accountId, poolId, options) => {
    try {
      const data = await client.delete(
        `/accounts/${accountId}/load_balancers/pools/${poolId}`
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('monitors <account-id>')
  .option('--fields <fields>', 'Comma-separated fields')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (accountId, options) => {
    try {
      const params = new URLSearchParams();
      if (options.fields) params.append('fields', options.fields);
      const query = params.toString();
      const url = `/accounts/${accountId}/load_balancers/monitors${
        query ? '?' + query : ''
      }`;
      const data = await client.get(url);
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('monitor-get <account-id> <monitor-id>')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (accountId, monitorId, options) => {
    try {
      const data = await client.get(
        `/accounts/${accountId}/load_balancers/monitors/${monitorId}`
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('monitor-create <account-id>')
  .requiredOption('--type <type>', 'Monitor type (http|https|tcp|udp_icmp|icmp_ping|smtp)')
  .option('--expected-codes <codes>', 'Expected HTTP codes (default "200")')
  .option('--path <path>', 'Health check path (default "/")')
  .option('--interval <interval>', 'Check interval in seconds (default 60)')
  .option('--timeout <timeout>', 'Timeout in seconds (default 5)')
  .option('--retries <retries>', 'Number of retries (default 2)')
  .option('--description <description>', 'Monitor description')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    try {
      const body: any = {
        type: options.type,
      };
      if (options.expectedCodes) body.expected_codes = options.expectedCodes;
      if (options.path) body.path = options.path;
      if (options.interval) body.interval = parseInt(options.interval);
      if (options.timeout) body.timeout = parseInt(options.timeout);
      if (options.retries) body.retries = parseInt(options.retries);
      if (options.description) body.description = options.description;
      const data = await client.post(
        `/accounts/${accountId}/load_balancers/monitors`,
        body
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

loadBalancersResource
  .command('monitor-delete <account-id> <monitor-id>')
  .option('--json', 'Output as JSON')
  .action(async (accountId, monitorId, options) => {
    try {
      const data = await client.delete(
        `/accounts/${accountId}/load_balancers/monitors/${monitorId}`
      );
      output(data.result, options);
    } catch (error) {
      handleError(error);
    }
  });

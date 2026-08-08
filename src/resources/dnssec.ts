import { Command } from 'commander';
import { client } from '../lib/client.js';
import { output } from '../lib/output.js';
import { handleError } from '../lib/errors.js';

export const dnssecResource = new Command('dnssec')
  .description('Manage DNSSEC settings');

dnssecResource
  .command('get <zone-id>')
  .description('Get DNSSEC status')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (zoneId, options) => {
    try {
      const response = await client.get(`/zones/${zoneId}/dnssec`);
      output(response.result, { json: !!options.json, format: options.format });
    } catch (error) {
      handleError(error);
    }
  });

dnssecResource
  .command('enable <zone-id>')
  .description('Enable DNSSEC')
  .option('--json', 'Output as JSON')
  .action(async (zoneId, options) => {
    try {
      const response = await client.patch(`/zones/${zoneId}/dnssec`, { status: 'active' });
      output(response.result, { json: !!options.json });
    } catch (error) {
      handleError(error);
    }
  });

dnssecResource
  .command('disable <zone-id>')
  .description('Disable DNSSEC')
  .option('--json', 'Output as JSON')
  .action(async (zoneId, options) => {
    try {
      const response = await client.delete(`/zones/${zoneId}/dnssec`);
      output(response.result, { json: !!options.json });
    } catch (error) {
      handleError(error);
    }
  });

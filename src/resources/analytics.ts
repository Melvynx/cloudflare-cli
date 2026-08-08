import { Command } from 'commander';
import { client } from '../lib/client.js';
import { output } from '../lib/output.js';
import { handleError } from '../lib/errors.js';

export const analyticsResource = new Command('analytics')
  .description('View zone analytics and GraphQL queries');

analyticsResource
  .command('dashboard <zone-id>')
  .description('Get analytics dashboard (legacy; prefer analytics graphql)')
  .option('--since <since>', 'Start time (ISO date or relative like -1440)')
  .option('--until <until>', 'End time (ISO date or 0 for now)')
  .option('--continuous', 'Continuous mode')
  .option('--fields <fields>', 'Comma-separated fields')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (zoneId, options) => {
    try {
      const params = new URLSearchParams();
      if (options.since) params.append('since', options.since);
      if (options.until) params.append('until', options.until);
      if (options.continuous) params.append('continuous', 'true');
      if (options.fields) params.append('fields', options.fields);
      const queryStr = params.toString();
      const url = `/zones/${zoneId}/analytics/dashboard${
        queryStr ? '?' + queryStr : ''
      }`;
      const response = await client.get(url);
      output(response.result, options.json, options.format);
    } catch (error) {
      handleError(error);
    }
  });

analyticsResource
  .command('colos <zone-id>')
  .description('Get colocation analytics (legacy; prefer analytics graphql)')
  .option('--since <since>', 'Start time (ISO date or relative like -1440)')
  .option('--until <until>', 'End time (ISO date or 0 for now)')
  .option('--continuous', 'Continuous mode')
  .option('--fields <fields>', 'Comma-separated fields')
  .option('--json', 'Output as JSON')
  .option('--format <format>', 'Output format')
  .action(async (zoneId, options) => {
    try {
      const params = new URLSearchParams();
      if (options.since) params.append('since', options.since);
      if (options.until) params.append('until', options.until);
      if (options.continuous) params.append('continuous', 'true');
      if (options.fields) params.append('fields', options.fields);
      const queryStr = params.toString();
      const url = `/zones/${zoneId}/analytics/colos${
        queryStr ? '?' + queryStr : ''
      }`;
      const response = await client.get(url);
      output(response.result, options.json, options.format);
    } catch (error) {
      handleError(error);
    }
  });

analyticsResource
  .command('graphql')
  .description('Execute GraphQL query')
  .requiredOption('--query <query>', 'GraphQL query string')
  .option('--variables <variables>', 'JSON string of variables')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const body: any = { query: options.query };
      if (options.variables) {
        body.variables = JSON.parse(options.variables);
      }
      const response = await client.post('/graphql', body);
      output(response, options.json);
    } catch (error) {
      handleError(error);
    }
  });

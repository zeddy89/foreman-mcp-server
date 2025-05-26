import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ForemanClient, ForemanConfig } from './foreman-client.js';

// Schema definitions for tool parameters
const HostListSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const HostGetSchema = z.object({
  id: z.string()
});

const HostCreateSchema = z.object({
  name: z.string(),
  organization_id: z.string(),
  location_id: z.string(),
  hostgroup_id: z.string().optional(),
  compute_resource_id: z.string().optional(),
  environment_id: z.string().optional(),
  ip: z.string().optional(),
  mac: z.string().optional(),
  build: z.boolean().optional(),
  enabled: z.boolean().optional(),
  managed: z.boolean().optional(),
  comment: z.string().optional()
});

const HostUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  hostgroup_id: z.string().optional(),
  environment_id: z.string().optional(),
  ip: z.string().optional(),
  mac: z.string().optional(),
  build: z.boolean().optional(),
  enabled: z.boolean().optional(),
  managed: z.boolean().optional(),
  comment: z.string().optional()
});

const HostDeleteSchema = z.object({
  id: z.string()
});

const HostPowerSchema = z.object({
  id: z.string(),
  action: z.enum(['start', 'stop', 'poweroff', 'reboot', 'reset', 'state', 'ready', 'cycle'])
});

const ContentViewListSchema = z.object({
  organization_id: z.string().optional(),
  environment_id: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional()
});

const ContentViewGetSchema = z.object({
  id: z.string()
});

const ContentViewCreateSchema = z.object({
  name: z.string(),
  organization_id: z.string(),
  description: z.string().optional(),
  repository_ids: z.array(z.string()).optional(),
  component_ids: z.array(z.string()).optional(),
  composite: z.boolean().optional()
});

const ContentViewPublishSchema = z.object({
  id: z.string(),
  description: z.string().optional()
});

const RepositoryListSchema = z.object({
  organization_id: z.string().optional(),
  product_id: z.string().optional(),
  name: z.string().optional(),
  content_type: z.string().optional()
});

const RepositoryCreateSchema = z.object({
  name: z.string(),
  product_id: z.string(),
  content_type: z.enum(['yum', 'docker', 'file', 'puppet', 'deb']),
  url: z.string().optional(),
  gpg_key_id: z.string().optional(),
  ssl_ca_cert_id: z.string().optional(),
  ssl_client_cert_id: z.string().optional(),
  ssl_client_key_id: z.string().optional(),
  download_policy: z.enum(['immediate', 'on_demand', 'background']).optional()
});

const RepositorySyncSchema = z.object({
  id: z.string()
});

const OrganizationListSchema = z.object({
  search: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const OrganizationCreateSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  description: z.string().optional()
});

const TaskListSchema = z.object({
  search: z.string().optional(),
  state: z.enum(['running', 'paused', 'stopped', 'pending', 'planned']).optional(),
  result: z.enum(['success', 'error', 'warning', 'pending']).optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

// Initialize MCP server
const server = new Server(
  {
    name: 'foreman-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Get Foreman configuration from environment variables
const getForemanConfig = (): ForemanConfig => {
  const baseUrl = process.env.FOREMAN_URL;
  const username = process.env.FOREMAN_USERNAME;
  const password = process.env.FOREMAN_PASSWORD;

  if (!baseUrl || !username || !password) {
    throw new Error('Missing required environment variables: FOREMAN_URL, FOREMAN_USERNAME, FOREMAN_PASSWORD');
  }

  return { baseUrl, username, password };
};

// Initialize Foreman client
let foremanClient: ForemanClient;

try {
  const config = getForemanConfig();
  foremanClient = new ForemanClient(config);
} catch (error) {
  console.error('Failed to initialize Foreman client:', error);
  process.exit(1);
}

// Define available tools
const tools: Tool[] = [
  // Host Management Tools
  {
    name: 'foreman_list_hosts',
    description: 'List all hosts in Foreman with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query string' },
        organization_id: { type: 'string', description: 'Filter by organization ID' },
        location_id: { type: 'string', description: 'Filter by location ID' },
        per_page: { type: 'number', description: 'Number of results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_host',
    description: 'Get detailed information about a specific host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_host',
    description: 'Create a new host in Foreman',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Host name' },
        organization_id: { type: 'string', description: 'Organization ID' },
        location_id: { type: 'string', description: 'Location ID' },
        hostgroup_id: { type: 'string', description: 'Host group ID' },
        compute_resource_id: { type: 'string', description: 'Compute resource ID' },
        environment_id: { type: 'string', description: 'Environment ID' },
        ip: { type: 'string', description: 'IP address' },
        mac: { type: 'string', description: 'MAC address' },
        build: { type: 'boolean', description: 'Build mode enabled' },
        enabled: { type: 'boolean', description: 'Host enabled' },
        managed: { type: 'boolean', description: 'Host managed by Foreman' },
        comment: { type: 'string', description: 'Host comment' }
      },
      required: ['name', 'organization_id', 'location_id']
    }
  },
  {
    name: 'foreman_update_host',
    description: 'Update an existing host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID or name' },
        name: { type: 'string', description: 'New host name' },
        hostgroup_id: { type: 'string', description: 'New host group ID' },
        environment_id: { type: 'string', description: 'New environment ID' },
        ip: { type: 'string', description: 'New IP address' },
        mac: { type: 'string', description: 'New MAC address' },
        build: { type: 'boolean', description: 'Build mode enabled' },
        enabled: { type: 'boolean', description: 'Host enabled' },
        managed: { type: 'boolean', description: 'Host managed by Foreman' },
        comment: { type: 'string', description: 'Host comment' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_host',
    description: 'Delete a host from Foreman',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_power_host',
    description: 'Perform power management action on a host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID or name' },
        action: { 
          type: 'string', 
          enum: ['start', 'stop', 'poweroff', 'reboot', 'reset', 'state', 'ready', 'cycle'],
          description: 'Power action to perform'
        }
      },
      required: ['id', 'action']
    }
  },
  // Content View Tools
  {
    name: 'foreman_list_content_views',
    description: 'List all content views',
    inputSchema: {
      type: 'object',
      properties: {
        organization_id: { type: 'string', description: 'Filter by organization ID' },
        environment_id: { type: 'string', description: 'Filter by environment ID' },
        name: { type: 'string', description: 'Filter by name' },
        search: { type: 'string', description: 'Search query' }
      }
    }
  },
  {
    name: 'foreman_get_content_view',
    description: 'Get detailed information about a content view',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Content view ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_content_view',
    description: 'Create a new content view',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Content view name' },
        organization_id: { type: 'string', description: 'Organization ID' },
        description: { type: 'string', description: 'Description' },
        repository_ids: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Repository IDs to include' 
        },
        component_ids: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Component IDs for composite views' 
        },
        composite: { type: 'boolean', description: 'Is composite view' }
      },
      required: ['name', 'organization_id']
    }
  },
  {
    name: 'foreman_publish_content_view',
    description: 'Publish a new version of a content view',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Content view ID' },
        description: { type: 'string', description: 'Version description' }
      },
      required: ['id']
    }
  },
  // Repository Tools
  {
    name: 'foreman_list_repositories',
    description: 'List all repositories',
    inputSchema: {
      type: 'object',
      properties: {
        organization_id: { type: 'string', description: 'Filter by organization ID' },
        product_id: { type: 'string', description: 'Filter by product ID' },
        name: { type: 'string', description: 'Filter by name' },
        content_type: { type: 'string', description: 'Filter by content type' }
      }
    }
  },
  {
    name: 'foreman_create_repository',
    description: 'Create a new repository',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Repository name' },
        product_id: { type: 'string', description: 'Product ID' },
        content_type: { 
          type: 'string',
          enum: ['yum', 'docker', 'file', 'puppet', 'deb'],
          description: 'Content type'
        },
        url: { type: 'string', description: 'Repository URL' },
        gpg_key_id: { type: 'string', description: 'GPG key ID' },
        download_policy: {
          type: 'string',
          enum: ['immediate', 'on_demand', 'background'],
          description: 'Download policy'
        }
      },
      required: ['name', 'product_id', 'content_type']
    }
  },
  {
    name: 'foreman_sync_repository',
    description: 'Synchronize a repository',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Repository ID' }
      },
      required: ['id']
    }
  },
  // Organization Tools
  {
    name: 'foreman_list_organizations',
    description: 'List all organizations',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_create_organization',
    description: 'Create a new organization',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Organization name' },
        label: { type: 'string', description: 'Organization label' },
        description: { type: 'string', description: 'Description' }
      },
      required: ['name']
    }
  },
  // Task Tools
  {
    name: 'foreman_list_tasks',
    description: 'List Foreman tasks',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        state: { 
          type: 'string',
          enum: ['running', 'paused', 'stopped', 'pending', 'planned'],
          description: 'Filter by state'
        },
        result: {
          type: 'string',
          enum: ['success', 'error', 'warning', 'pending'],
          description: 'Filter by result'
        },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  }
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      // Host Management
      case 'foreman_list_hosts': {
        const params = HostListSchema.parse(args);
        const result = await foremanClient.listHosts(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_host': {
        const params = HostGetSchema.parse(args);
        const result = await foremanClient.getHost(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_host': {
        const params = HostCreateSchema.parse(args);
        const result = await foremanClient.createHost(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_host': {
        const params = HostUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateHost(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_host': {
        const params = HostDeleteSchema.parse(args);
        const result = await foremanClient.deleteHost(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_power_host': {
        const params = HostPowerSchema.parse(args);
        const result = await foremanClient.powerHost(params.id, params.action);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Content View Management
      case 'foreman_list_content_views': {
        const params = ContentViewListSchema.parse(args);
        const result = await foremanClient.listContentViews(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_content_view': {
        const params = ContentViewGetSchema.parse(args);
        const result = await foremanClient.getContentView(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_content_view': {
        const params = ContentViewCreateSchema.parse(args);
        const result = await foremanClient.createContentView(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_publish_content_view': {
        const params = ContentViewPublishSchema.parse(args);
        const result = await foremanClient.publishContentView(params.id, params.description);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Repository Management
      case 'foreman_list_repositories': {
        const params = RepositoryListSchema.parse(args);
        const result = await foremanClient.listRepositories(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_repository': {
        const params = RepositoryCreateSchema.parse(args);
        const result = await foremanClient.createRepository(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_sync_repository': {
        const params = RepositorySyncSchema.parse(args);
        const result = await foremanClient.syncRepository(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Organization Management
      case 'foreman_list_organizations': {
        const params = OrganizationListSchema.parse(args);
        const result = await foremanClient.listOrganizations(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_organization': {
        const params = OrganizationCreateSchema.parse(args);
        const result = await foremanClient.createOrganization(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Task Management
      case 'foreman_list_tasks': {
        const params = TaskListSchema.parse(args);
        const result = await foremanClient.listTasks(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { 
      content: [{ 
        type: 'text', 
        text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}` 
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Foreman MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
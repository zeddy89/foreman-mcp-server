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

const ComputeResourceListSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ComputeResourceGetSchema = z.object({
  id: z.string()
});

const ComputeResourceCreateSchema = z.object({
  name: z.string(),
  provider: z.enum(['Proxmox', 'Vmware', 'EC2', 'GCE', 'Libvirt', 'Ovirt', 'Openstack']),
  url: z.string(),
  user: z.string().optional(),
  password: z.string().optional(),
  datacenter: z.string().optional(),
  use_v4: z.boolean().optional(),
  ssl_verify_peer: z.boolean().optional(),
  caching_enabled: z.boolean().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const ComputeResourceUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  url: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  datacenter: z.string().optional(),
  use_v4: z.boolean().optional(),
  ssl_verify_peer: z.boolean().optional(),
  caching_enabled: z.boolean().optional()
});

const SmartProxyListSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const SmartProxyCreateSchema = z.object({
  name: z.string(),
  url: z.string(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const SmartProxyUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  url: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const ComputeProfileListSchema = z.object({
  search: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ComputeProfileCreateSchema = z.object({
  name: z.string()
});

const SubnetListSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  domain_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const SubnetCreateSchema = z.object({
  name: z.string(),
  network: z.string(),
  mask: z.string(),
  gateway: z.string().optional(),
  dns_primary: z.string().optional(),
  dns_secondary: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  vlanid: z.string().optional(),
  domain_ids: z.array(z.string()).optional(),
  dhcp_id: z.string().optional(),
  tftp_id: z.string().optional(),
  dns_id: z.string().optional(),
  boot_mode: z.enum(['DHCP', 'Static']).optional(),
  ipam: z.enum(['DHCP', 'Internal DB', 'None']).optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const SubnetUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  network: z.string().optional(),
  mask: z.string().optional(),
  gateway: z.string().optional(),
  dns_primary: z.string().optional(),
  dns_secondary: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  vlanid: z.string().optional(),
  boot_mode: z.enum(['DHCP', 'Static']).optional(),
  ipam: z.enum(['DHCP', 'Internal DB', 'None']).optional()
});

const DomainListSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const DomainCreateSchema = z.object({
  name: z.string(),
  fullname: z.string().optional(),
  dns_id: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
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
  },
  // Compute Resource Tools
  {
    name: 'foreman_list_compute_resources',
    description: 'List all compute resources (Proxmox, VMware, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        organization_id: { type: 'string', description: 'Filter by organization ID' },
        location_id: { type: 'string', description: 'Filter by location ID' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_compute_resource',
    description: 'Get detailed information about a compute resource',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute resource ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_compute_resource',
    description: 'Create a new compute resource (e.g., add a Proxmox node)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Resource name' },
        provider: { 
          type: 'string',
          enum: ['Proxmox', 'Vmware', 'EC2', 'GCE', 'Libvirt', 'Ovirt', 'Openstack'],
          description: 'Provider type'
        },
        url: { type: 'string', description: 'API endpoint URL (e.g., https://proxmox.example.com:8006/api2/json)' },
        user: { type: 'string', description: 'API username' },
        password: { type: 'string', description: 'API password' },
        datacenter: { type: 'string', description: 'Datacenter (for VMware)' },
        use_v4: { type: 'boolean', description: 'Use API v4 (for Proxmox)' },
        ssl_verify_peer: { type: 'boolean', description: 'Verify SSL certificate' },
        caching_enabled: { type: 'boolean', description: 'Enable caching' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name', 'provider', 'url']
    }
  },
  {
    name: 'foreman_update_compute_resource',
    description: 'Update an existing compute resource',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute resource ID' },
        name: { type: 'string', description: 'New name' },
        url: { type: 'string', description: 'New API endpoint URL' },
        user: { type: 'string', description: 'New username' },
        password: { type: 'string', description: 'New password' },
        datacenter: { type: 'string', description: 'New datacenter' },
        use_v4: { type: 'boolean', description: 'Use API v4' },
        ssl_verify_peer: { type: 'boolean', description: 'Verify SSL' },
        caching_enabled: { type: 'boolean', description: 'Enable caching' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_compute_resource',
    description: 'Delete a compute resource',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute resource ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_get_compute_resource_available_images',
    description: 'Get available images/templates from a compute resource',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute resource ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_get_compute_resource_available_networks',
    description: 'Get available networks from a compute resource',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute resource ID' }
      },
      required: ['id']
    }
  },
  // Smart Proxy Tools
  {
    name: 'foreman_list_smart_proxies',
    description: 'List all smart proxies',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        organization_id: { type: 'string', description: 'Filter by organization' },
        location_id: { type: 'string', description: 'Filter by location' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_smart_proxy',
    description: 'Get detailed information about a smart proxy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Smart proxy ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_smart_proxy',
    description: 'Create a new smart proxy',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Smart proxy name' },
        url: { type: 'string', description: 'Smart proxy URL (e.g., https://proxy.example.com:8443)' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name', 'url']
    }
  },
  {
    name: 'foreman_update_smart_proxy',
    description: 'Update a smart proxy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Smart proxy ID' },
        name: { type: 'string', description: 'New name' },
        url: { type: 'string', description: 'New URL' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_smart_proxy',
    description: 'Delete a smart proxy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Smart proxy ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_refresh_smart_proxy',
    description: 'Refresh smart proxy features',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Smart proxy ID' }
      },
      required: ['id']
    }
  },
  // Compute Profile Tools
  {
    name: 'foreman_list_compute_profiles',
    description: 'List all compute profiles',
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
    name: 'foreman_get_compute_profile',
    description: 'Get detailed information about a compute profile',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute profile ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_compute_profile',
    description: 'Create a new compute profile',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Profile name (e.g., "Small", "Medium", "Large")' }
      },
      required: ['name']
    }
  },
  {
    name: 'foreman_update_compute_profile',
    description: 'Update a compute profile',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute profile ID' },
        name: { type: 'string', description: 'New profile name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_compute_profile',
    description: 'Delete a compute profile',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Compute profile ID' }
      },
      required: ['id']
    }
  },
  // Subnet Tools
  {
    name: 'foreman_list_subnets',
    description: 'List all subnets',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        organization_id: { type: 'string', description: 'Filter by organization' },
        location_id: { type: 'string', description: 'Filter by location' },
        domain_id: { type: 'string', description: 'Filter by domain' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_subnet',
    description: 'Get detailed information about a subnet',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Subnet ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_subnet',
    description: 'Create a new subnet',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Subnet name' },
        network: { type: 'string', description: 'Network address (e.g., 192.168.1.0)' },
        mask: { type: 'string', description: 'Subnet mask (e.g., 255.255.255.0)' },
        gateway: { type: 'string', description: 'Gateway address' },
        dns_primary: { type: 'string', description: 'Primary DNS server' },
        dns_secondary: { type: 'string', description: 'Secondary DNS server' },
        from: { type: 'string', description: 'IP range start' },
        to: { type: 'string', description: 'IP range end' },
        vlanid: { type: 'string', description: 'VLAN ID' },
        domain_ids: { type: 'array', items: { type: 'string' }, description: 'Domain IDs' },
        dhcp_id: { type: 'string', description: 'DHCP smart proxy ID' },
        tftp_id: { type: 'string', description: 'TFTP smart proxy ID' },
        dns_id: { type: 'string', description: 'DNS smart proxy ID' },
        boot_mode: { type: 'string', enum: ['DHCP', 'Static'], description: 'Boot mode' },
        ipam: { type: 'string', enum: ['DHCP', 'Internal DB', 'None'], description: 'IP address management' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name', 'network', 'mask']
    }
  },
  {
    name: 'foreman_update_subnet',
    description: 'Update a subnet',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Subnet ID' },
        name: { type: 'string', description: 'New name' },
        network: { type: 'string', description: 'New network address' },
        mask: { type: 'string', description: 'New subnet mask' },
        gateway: { type: 'string', description: 'New gateway' },
        dns_primary: { type: 'string', description: 'New primary DNS' },
        dns_secondary: { type: 'string', description: 'New secondary DNS' },
        from: { type: 'string', description: 'New IP range start' },
        to: { type: 'string', description: 'New IP range end' },
        vlanid: { type: 'string', description: 'New VLAN ID' },
        boot_mode: { type: 'string', enum: ['DHCP', 'Static'], description: 'Boot mode' },
        ipam: { type: 'string', enum: ['DHCP', 'Internal DB', 'None'], description: 'IP management' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_subnet',
    description: 'Delete a subnet',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Subnet ID' }
      },
      required: ['id']
    }
  },
  // Domain Tools
  {
    name: 'foreman_list_domains',
    description: 'List all domains',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query' },
        organization_id: { type: 'string', description: 'Filter by organization' },
        location_id: { type: 'string', description: 'Filter by location' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_domain',
    description: 'Get detailed information about a domain',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Domain ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_domain',
    description: 'Create a new domain',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Domain name (e.g., example.com)' },
        fullname: { type: 'string', description: 'Full domain name' },
        dns_id: { type: 'string', description: 'DNS smart proxy ID' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name']
    }
  },
  {
    name: 'foreman_update_domain',
    description: 'Update a domain',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Domain ID' },
        name: { type: 'string', description: 'New domain name' },
        fullname: { type: 'string', description: 'New full name' },
        dns_id: { type: 'string', description: 'New DNS proxy ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_domain',
    description: 'Delete a domain',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Domain ID' }
      },
      required: ['id']
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
      // Compute Resource Management
      case 'foreman_list_compute_resources': {
        const params = ComputeResourceListSchema.parse(args);
        const result = await foremanClient.listComputeResources(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getComputeResource(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_compute_resource': {
        const params = ComputeResourceCreateSchema.parse(args);
        const result = await foremanClient.createComputeResource(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_compute_resource': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateComputeResource(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_compute_resource': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.deleteComputeResource(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource_available_images': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getComputeResourceAvailableImages(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource_available_networks': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getComputeResourceAvailableNetworks(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Smart Proxy Management
      case 'foreman_list_smart_proxies': {
        const params = SmartProxyListSchema.parse(args);
        const result = await foremanClient.listSmartProxies(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getSmartProxy(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_smart_proxy': {
        const params = SmartProxyCreateSchema.parse(args);
        const result = await foremanClient.createSmartProxy(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_smart_proxy': {
        const params = SmartProxyUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateSmartProxy(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.deleteSmartProxy(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_refresh_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.refreshSmartProxy(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Compute Profile Management
      case 'foreman_list_compute_profiles': {
        const params = ComputeProfileListSchema.parse(args);
        const result = await foremanClient.listComputeProfiles(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_profile': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getComputeProfile(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_compute_profile': {
        const params = ComputeProfileCreateSchema.parse(args);
        const result = await foremanClient.createComputeProfile(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_compute_profile': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateComputeProfile(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_compute_profile': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.deleteComputeProfile(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Subnet Management
      case 'foreman_list_subnets': {
        const params = SubnetListSchema.parse(args);
        const result = await foremanClient.listSubnets(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_subnet': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getSubnet(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_subnet': {
        const params = SubnetCreateSchema.parse(args);
        const result = await foremanClient.createSubnet(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_subnet': {
        const params = SubnetUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateSubnet(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_subnet': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.deleteSubnet(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Domain Management
      case 'foreman_list_domains': {
        const params = DomainListSchema.parse(args);
        const result = await foremanClient.listDomains(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_domain': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.getDomain(params.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_domain': {
        const params = DomainCreateSchema.parse(args);
        const result = await foremanClient.createDomain(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_domain': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { id, ...updateData } = params;
        const result = await foremanClient.updateDomain(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_domain': {
        const params = ComputeResourceGetSchema.parse(args);
        const result = await foremanClient.deleteDomain(params.id);
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
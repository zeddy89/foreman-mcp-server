import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ForemanClient, ForemanConfig } from './foreman-client.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Schema definitions for tool parameters
// Common server parameter for all schemas
const ServerParam = {
  server: z.string().optional().describe('Server name to use (e.g., "foreman", "satellite"). If not specified, uses the default server.')
};

const HostListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const HostGetSchema = z.object({
  ...ServerParam,
  id: z.string()
});

const HostCreateSchema = z.object({
  ...ServerParam,
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
  ...ServerParam,
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
  ...ServerParam,
  id: z.string()
});

const HostPowerSchema = z.object({
  ...ServerParam,
  id: z.string(),
  action: z.enum(['start', 'stop', 'poweroff', 'reboot', 'reset', 'state', 'ready', 'cycle'])
});

const HostGroupListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const HostGroupGetSchema = z.object({
  ...ServerParam,
  id: z.string()
});

const HostGroupCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  parent_id: z.string().optional(),
  environment_id: z.string().optional(),
  compute_profile_id: z.string().optional(),
  compute_resource_id: z.string().optional(),
  subnet_id: z.string().optional(),
  domain_id: z.string().optional(),
  realm_id: z.string().optional(),
  architecture_id: z.string().optional(),
  operatingsystem_id: z.string().optional(),
  medium_id: z.string().optional(),
  ptable_id: z.string().optional(),
  pxe_loader: z.string().optional(),
  root_pass: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const HostGroupUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  parent_id: z.string().optional(),
  environment_id: z.string().optional(),
  compute_profile_id: z.string().optional(),
  compute_resource_id: z.string().optional(),
  subnet_id: z.string().optional(),
  domain_id: z.string().optional(),
  realm_id: z.string().optional(),
  architecture_id: z.string().optional(),
  operatingsystem_id: z.string().optional(),
  medium_id: z.string().optional(),
  ptable_id: z.string().optional(),
  pxe_loader: z.string().optional(),
  root_pass: z.string().optional()
});

const ProductListSchema = z.object({
  ...ServerParam,
  organization_id: z.string(),
  name: z.string().optional(),
  search: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ProductGetSchema = z.object({
  ...ServerParam,
  id: z.string()
});

const ProductCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  organization_id: z.string(),
  description: z.string().optional(),
  gpg_key_id: z.string().optional(),
  ssl_ca_cert_id: z.string().optional(),
  ssl_client_cert_id: z.string().optional(),
  ssl_client_key_id: z.string().optional(),
  sync_plan_id: z.string().optional()
});

const ProductUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  gpg_key_id: z.string().optional(),
  ssl_ca_cert_id: z.string().optional(),
  ssl_client_cert_id: z.string().optional(),
  ssl_client_key_id: z.string().optional(),
  sync_plan_id: z.string().optional()
});

const ContentViewListSchema = z.object({
  ...ServerParam,
  organization_id: z.string(),
  environment_id: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional()
});

const ContentViewGetSchema = z.object({
  ...ServerParam,
  id: z.string()
});

const ContentViewCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  organization_id: z.string(),
  description: z.string().optional(),
  repository_ids: z.array(z.string()).optional(),
  component_ids: z.array(z.string()).optional(),
  composite: z.boolean().optional()
});

const ContentViewPublishSchema = z.object({
  ...ServerParam,
  id: z.string(),
  description: z.string().optional()
});

const RepositoryListSchema = z.object({
  ...ServerParam,
  organization_id: z.string(),
  product_id: z.string().optional(),
  name: z.string().optional(),
  content_type: z.string().optional()
});

const RepositoryCreateSchema = z.object({
  ...ServerParam,
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
  ...ServerParam,
  id: z.string()
});

const OrganizationListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const OrganizationCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  label: z.string().optional(),
  description: z.string().optional()
});

const TaskListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  state: z.enum(['running', 'paused', 'stopped', 'pending', 'planned']).optional(),
  result: z.enum(['success', 'error', 'warning', 'pending']).optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ComputeResourceListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ComputeResourceGetSchema = z.object({
  ...ServerParam,
  id: z.string()
});

const ComputeResourceCreateSchema = z.object({
  ...ServerParam,
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
  ...ServerParam,
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
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const SmartProxyCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  url: z.string(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const SmartProxyUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  url: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const ComputeProfileListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const ComputeProfileCreateSchema = z.object({
  ...ServerParam,
  name: z.string()
});

const SubnetListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  domain_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const SubnetCreateSchema = z.object({
  ...ServerParam,
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
  ...ServerParam,
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
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const DomainCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  fullname: z.string().optional(),
  dns_id: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

// Installation Media Schemas
const MediaListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const MediaCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  path: z.string(),
  os_family: z.enum(['Debian', 'Redhat', 'SUSE', 'Windows', 'Altlinux', 'Archlinux', 'Coreos', 'FreeBSD', 'Gentoo', 'Junos', 'NXOS', 'Rancheros', 'Solaris', 'VRP', 'XenServer']).optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const MediaUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  path: z.string().optional(),
  os_family: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

// Partition Table Schemas
const PartitionTableListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const PartitionTableCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  layout: z.string(),
  os_family: z.enum(['Debian', 'Redhat', 'SUSE', 'Windows', 'Altlinux', 'Archlinux', 'Coreos', 'FreeBSD', 'Gentoo', 'Junos', 'NXOS', 'Rancheros', 'Solaris', 'VRP', 'XenServer']).optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

const PartitionTableUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  layout: z.string().optional(),
  os_family: z.string().optional(),
  organization_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional()
});

// Operating System Schemas
const OperatingSystemListSchema = z.object({
  ...ServerParam,
  search: z.string().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  per_page: z.number().optional(),
  page: z.number().optional()
});

const OperatingSystemCreateSchema = z.object({
  ...ServerParam,
  name: z.string(),
  major: z.string(),
  minor: z.string().optional(),
  family: z.enum(['Debian', 'Redhat', 'SUSE', 'Windows', 'Altlinux', 'Archlinux', 'Coreos', 'FreeBSD', 'Gentoo', 'Junos', 'NXOS', 'Rancheros', 'Solaris', 'VRP', 'XenServer']).optional(),
  release_name: z.string().optional(),
  description: z.string().optional(),
  password_hash: z.enum(['MD5', 'SHA256', 'SHA512', 'Base64', 'Base64-Windows']).optional(),
  architecture_ids: z.array(z.string()).optional(),
  medium_ids: z.array(z.string()).optional(),
  ptable_ids: z.array(z.string()).optional()
});

const OperatingSystemUpdateSchema = z.object({
  ...ServerParam,
  id: z.string(),
  name: z.string().optional(),
  major: z.string().optional(),
  minor: z.string().optional(),
  family: z.string().optional(),
  release_name: z.string().optional(),
  description: z.string().optional(),
  password_hash: z.string().optional(),
  architecture_ids: z.array(z.string()).optional(),
  medium_ids: z.array(z.string()).optional(),
  ptable_ids: z.array(z.string()).optional()
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

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Foreman configuration from environment variables or config file
const getForemanConfig = (serverName?: string): ForemanConfig => {
  // First try environment variables
  const baseUrl = process.env.FOREMAN_URL;
  const username = process.env.FOREMAN_USERNAME;
  const token = process.env.FOREMAN_TOKEN;

  if (baseUrl && username && token) {
    return { baseUrl, username, token };
  }

  // Fall back to config file
  const configPath = join(__dirname, '..', 'foreman-config.json');
  if (existsSync(configPath)) {
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // Check for new multi-server format
    if (config.servers) {
      const selectedServer = serverName || config.defaultServer || 'foreman';
      const serverConfig = config.servers[selectedServer];
      
      if (!serverConfig) {
        throw new Error(`Server '${selectedServer}' not found in configuration. Available servers: ${Object.keys(config.servers).join(', ')}`);
      }
      
      if (serverConfig.baseUrl && serverConfig.username && serverConfig.token) {
        return {
          baseUrl: serverConfig.baseUrl,
          username: serverConfig.username,
          token: serverConfig.token
        };
      }
    }
    
    // Support legacy single-server format
    if (config.baseUrl && config.username && config.token) {
      return {
        baseUrl: config.baseUrl,
        username: config.username,
        token: config.token
      };
    }
  }

  throw new Error('Foreman configuration not found. Please set environment variables (FOREMAN_URL, FOREMAN_USERNAME, FOREMAN_TOKEN) or create foreman-config.json');
};

// Store multiple Foreman clients
const foremanClients: { [key: string]: ForemanClient } = {};
let availableServers: string[] = [];
let initializationError: Error | null = null;

// Initialize Foreman clients from config
try {
  const configPath = join(__dirname, '..', 'foreman-config.json');
  if (existsSync(configPath)) {
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    if (config.servers) {
      // Multi-server configuration
      availableServers = Object.keys(config.servers);
      for (const serverName of availableServers) {
        const serverConfig = config.servers[serverName];
        if (serverConfig.baseUrl && serverConfig.username && serverConfig.token) {
          foremanClients[serverName] = new ForemanClient({
            baseUrl: serverConfig.baseUrl,
            username: serverConfig.username,
            token: serverConfig.token
          });
        }
      }
    } else if (config.baseUrl && config.username && config.token) {
      // Legacy single-server configuration
      foremanClients['default'] = new ForemanClient(config);
      availableServers = ['default'];
    }
  } else {
    // Try environment variables
    const baseUrl = process.env.FOREMAN_URL;
    const username = process.env.FOREMAN_USERNAME;
    const token = process.env.FOREMAN_TOKEN;
    
    if (baseUrl && username && token) {
      foremanClients['default'] = new ForemanClient({ baseUrl, username, token });
      availableServers = ['default'];
    }
  }
  
  if (Object.keys(foremanClients).length === 0) {
    throw new Error('No Foreman servers configured');
  }
} catch (error) {
  // Store error for later reporting through MCP protocol
  // Do NOT use console.error as it corrupts MCP communication
  initializationError = error as Error;
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
        server: { type: 'string', description: 'Server name to use (e.g., "foreman", "satellite"). If not specified, uses the default server.' },
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
        server: { type: 'string', description: 'Server name to use (e.g., "foreman", "satellite"). If not specified, uses the default server.' },
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
        server: { type: 'string', description: 'Server name to use (e.g., "foreman", "satellite"). If not specified, uses the default server.' },
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
  // Host Group Management Tools
  {
    name: 'foreman_list_hostgroups',
    description: 'List all host groups',
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
    name: 'foreman_get_hostgroup',
    description: 'Get detailed information about a host group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host group ID or name' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_hostgroup',
    description: 'Create a new host group',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Host group name' },
        parent_id: { type: 'string', description: 'Parent host group ID' },
        environment_id: { type: 'string', description: 'Environment ID' },
        compute_profile_id: { type: 'string', description: 'Compute profile ID' },
        compute_resource_id: { type: 'string', description: 'Compute resource ID' },
        subnet_id: { type: 'string', description: 'Subnet ID' },
        domain_id: { type: 'string', description: 'Domain ID' },
        realm_id: { type: 'string', description: 'Realm ID' },
        architecture_id: { type: 'string', description: 'Architecture ID' },
        operatingsystem_id: { type: 'string', description: 'Operating system ID' },
        medium_id: { type: 'string', description: 'Installation medium ID' },
        ptable_id: { type: 'string', description: 'Partition table ID' },
        pxe_loader: { type: 'string', description: 'PXE loader' },
        root_pass: { type: 'string', description: 'Root password' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name']
    }
  },
  {
    name: 'foreman_update_hostgroup',
    description: 'Update an existing host group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host group ID' },
        name: { type: 'string', description: 'New name' },
        parent_id: { type: 'string', description: 'New parent host group ID' },
        environment_id: { type: 'string', description: 'New environment ID' },
        compute_profile_id: { type: 'string', description: 'New compute profile ID' },
        compute_resource_id: { type: 'string', description: 'New compute resource ID' },
        subnet_id: { type: 'string', description: 'New subnet ID' },
        domain_id: { type: 'string', description: 'New domain ID' },
        realm_id: { type: 'string', description: 'New realm ID' },
        architecture_id: { type: 'string', description: 'New architecture ID' },
        operatingsystem_id: { type: 'string', description: 'New operating system ID' },
        medium_id: { type: 'string', description: 'New installation medium ID' },
        ptable_id: { type: 'string', description: 'New partition table ID' },
        pxe_loader: { type: 'string', description: 'New PXE loader' },
        root_pass: { type: 'string', description: 'New root password' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_hostgroup',
    description: 'Delete a host group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host group ID' }
      },
      required: ['id']
    }
  },
  // Product Management Tools
  {
    name: 'foreman_list_products',
    description: 'List all products in an organization',
    inputSchema: {
      type: 'object',
      required: ['organization_id'],
      properties: {
        organization_id: { type: 'string', description: 'Organization ID (required)' },
        name: { type: 'string', description: 'Filter by name' },
        search: { type: 'string', description: 'Search query' },
        per_page: { type: 'number', description: 'Results per page' },
        page: { type: 'number', description: 'Page number' }
      }
    }
  },
  {
    name: 'foreman_get_product',
    description: 'Get detailed information about a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_product',
    description: 'Create a new product',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        organization_id: { type: 'string', description: 'Organization ID' },
        description: { type: 'string', description: 'Product description' },
        gpg_key_id: { type: 'string', description: 'GPG key ID' },
        ssl_ca_cert_id: { type: 'string', description: 'SSL CA certificate ID' },
        ssl_client_cert_id: { type: 'string', description: 'SSL client certificate ID' },
        ssl_client_key_id: { type: 'string', description: 'SSL client key ID' },
        sync_plan_id: { type: 'string', description: 'Sync plan ID' }
      },
      required: ['name', 'organization_id']
    }
  },
  {
    name: 'foreman_update_product',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' },
        name: { type: 'string', description: 'New product name' },
        description: { type: 'string', description: 'New description' },
        gpg_key_id: { type: 'string', description: 'New GPG key ID' },
        ssl_ca_cert_id: { type: 'string', description: 'New SSL CA certificate ID' },
        ssl_client_cert_id: { type: 'string', description: 'New SSL client certificate ID' },
        ssl_client_key_id: { type: 'string', description: 'New SSL client key ID' },
        sync_plan_id: { type: 'string', description: 'New sync plan ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_product',
    description: 'Delete a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_sync_product',
    description: 'Synchronize all repositories in a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' }
      },
      required: ['id']
    }
  },
  // Content View Tools
  {
    name: 'foreman_list_content_views',
    description: 'List all content views in an organization',
    inputSchema: {
      type: 'object',
      required: ['organization_id'],
      properties: {
        organization_id: { type: 'string', description: 'Organization ID (required)' },
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
    description: 'List all repositories in an organization',
    inputSchema: {
      type: 'object',
      required: ['organization_id'],
      properties: {
        organization_id: { type: 'string', description: 'Organization ID (required)' },
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
  },
  // Installation Media Tools
  {
    name: 'foreman_list_media',
    description: 'List all installation media',
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
    name: 'foreman_get_medium',
    description: 'Get details of an installation medium',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Medium ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_medium',
    description: 'Create a new installation medium',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Medium name' },
        path: { type: 'string', description: 'URL or path to the medium (e.g., http://mirror.centos.org/centos/$version/os/$arch)' },
        os_family: { type: 'string', description: 'Operating system family' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name', 'path']
    }
  },
  {
    name: 'foreman_update_medium',
    description: 'Update an installation medium',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Medium ID' },
        name: { type: 'string', description: 'New name' },
        path: { type: 'string', description: 'New path' },
        os_family: { type: 'string', description: 'Operating system family' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_medium',
    description: 'Delete an installation medium',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Medium ID' }
      },
      required: ['id']
    }
  },
  // Partition Table Tools
  {
    name: 'foreman_list_partition_tables',
    description: 'List all partition tables',
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
    name: 'foreman_get_partition_table',
    description: 'Get details of a partition table',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Partition table ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_partition_table',
    description: 'Create a new partition table',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Partition table name' },
        layout: { type: 'string', description: 'Partition table layout content' },
        os_family: { type: 'string', description: 'Operating system family' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['name', 'layout']
    }
  },
  {
    name: 'foreman_update_partition_table',
    description: 'Update a partition table',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Partition table ID' },
        name: { type: 'string', description: 'New name' },
        layout: { type: 'string', description: 'New layout content' },
        os_family: { type: 'string', description: 'Operating system family' },
        organization_ids: { type: 'array', items: { type: 'string' }, description: 'Organization IDs' },
        location_ids: { type: 'array', items: { type: 'string' }, description: 'Location IDs' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_partition_table',
    description: 'Delete a partition table',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Partition table ID' }
      },
      required: ['id']
    }
  },
  // Operating System Tools
  {
    name: 'foreman_list_operating_systems',
    description: 'List all operating systems',
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
    name: 'foreman_get_operating_system',
    description: 'Get details of an operating system',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Operating system ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_create_operating_system',
    description: 'Create a new operating system',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'OS name (e.g., CentOS)' },
        major: { type: 'string', description: 'Major version (e.g., 7)' },
        minor: { type: 'string', description: 'Minor version (e.g., 9)' },
        family: { type: 'string', description: 'OS family (Redhat, Debian, etc.)' },
        release_name: { type: 'string', description: 'Release name' },
        description: { type: 'string', description: 'Description' },
        password_hash: { type: 'string', description: 'Password hash type' },
        architecture_ids: { type: 'array', items: { type: 'string' }, description: 'Architecture IDs' },
        medium_ids: { type: 'array', items: { type: 'string' }, description: 'Installation media IDs' },
        ptable_ids: { type: 'array', items: { type: 'string' }, description: 'Partition table IDs' }
      },
      required: ['name', 'major']
    }
  },
  {
    name: 'foreman_update_operating_system',
    description: 'Update an operating system',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Operating system ID' },
        name: { type: 'string', description: 'New name' },
        major: { type: 'string', description: 'Major version' },
        minor: { type: 'string', description: 'Minor version' },
        family: { type: 'string', description: 'OS family' },
        release_name: { type: 'string', description: 'Release name' },
        description: { type: 'string', description: 'Description' },
        password_hash: { type: 'string', description: 'Password hash type' },
        architecture_ids: { type: 'array', items: { type: 'string' }, description: 'Architecture IDs' },
        medium_ids: { type: 'array', items: { type: 'string' }, description: 'Installation media IDs' },
        ptable_ids: { type: 'array', items: { type: 'string' }, description: 'Partition table IDs' }
      },
      required: ['id']
    }
  },
  {
    name: 'foreman_delete_operating_system',
    description: 'Delete an operating system',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Operating system ID' }
      },
      required: ['id']
    }
  }
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Helper function to get the appropriate Foreman client
const getClient = (serverName?: string): ForemanClient => {
  if (Object.keys(foremanClients).length === 0) {
    const errorMessage = initializationError 
      ? `Foreman client initialization failed: ${initializationError.message}`
      : 'No Foreman clients initialized';
    throw new Error(errorMessage);
  }
  
  // If no server specified, use the first available or 'foreman' if it exists
  const selectedServer = serverName || (foremanClients['foreman'] ? 'foreman' : availableServers[0]);
  const client = foremanClients[selectedServer];
  
  if (!client) {
    throw new Error(`Server '${selectedServer}' not found. Available servers: ${availableServers.join(', ')}`);
  }
  
  return client;
};

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      // Host Management
      case 'foreman_list_hosts': {
        const params = HostListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listHosts(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_host': {
        const params = HostGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getHost(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_host': {
        const params = HostCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createHost(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_host': {
        const params = HostUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateHost(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_host': {
        const params = HostDeleteSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteHost(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_power_host': {
        const params = HostPowerSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.powerHost(apiParams.id, apiParams.action);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Host Group Management
      case 'foreman_list_hostgroups': {
        const params = HostGroupListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listHostGroups(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_hostgroup': {
        const params = HostGroupGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getHostGroup(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_hostgroup': {
        const params = HostGroupCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createHostGroup(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_hostgroup': {
        const params = HostGroupUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateHostGroup(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_hostgroup': {
        const params = HostGroupGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteHostGroup(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Product Management
      case 'foreman_list_products': {
        const params = ProductListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listProducts(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_product': {
        const params = ProductGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getProduct(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_product': {
        const params = ProductCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createProduct(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_product': {
        const params = ProductUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateProduct(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_product': {
        const params = ProductGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteProduct(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_sync_product': {
        const params = ProductGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.syncProduct(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Content View Management
      case 'foreman_list_content_views': {
        const params = ContentViewListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listContentViews(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_content_view': {
        const params = ContentViewGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getContentView(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_content_view': {
        const params = ContentViewCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createContentView(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_publish_content_view': {
        const params = ContentViewPublishSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.publishContentView(apiParams.id, apiParams.description);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Repository Management
      case 'foreman_list_repositories': {
        const params = RepositoryListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listRepositories(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_repository': {
        const params = RepositoryCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createRepository(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_sync_repository': {
        const params = RepositorySyncSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.syncRepository(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Organization Management
      case 'foreman_list_organizations': {
        const params = OrganizationListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listOrganizations(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_organization': {
        const params = OrganizationCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createOrganization(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Task Management
      case 'foreman_list_tasks': {
        const params = TaskListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listTasks(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Compute Resource Management
      case 'foreman_list_compute_resources': {
        const params = ComputeResourceListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listComputeResources(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getComputeResource(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_compute_resource': {
        const params = ComputeResourceCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createComputeResource(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_compute_resource': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateComputeResource(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_compute_resource': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteComputeResource(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource_available_images': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getComputeResourceAvailableImages(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_resource_available_networks': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getComputeResourceAvailableNetworks(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Smart Proxy Management
      case 'foreman_list_smart_proxies': {
        const params = SmartProxyListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listSmartProxies(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getSmartProxy(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_smart_proxy': {
        const params = SmartProxyCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createSmartProxy(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_smart_proxy': {
        const params = SmartProxyUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateSmartProxy(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteSmartProxy(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_refresh_smart_proxy': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.refreshSmartProxy(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Compute Profile Management
      case 'foreman_list_compute_profiles': {
        const params = ComputeProfileListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listComputeProfiles(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_compute_profile': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getComputeProfile(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_compute_profile': {
        const params = ComputeProfileCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createComputeProfile(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_compute_profile': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateComputeProfile(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_compute_profile': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteComputeProfile(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Subnet Management
      case 'foreman_list_subnets': {
        const params = SubnetListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listSubnets(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_subnet': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getSubnet(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_subnet': {
        const params = SubnetCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createSubnet(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_subnet': {
        const params = SubnetUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateSubnet(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_subnet': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteSubnet(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Domain Management
      case 'foreman_list_domains': {
        const params = DomainListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listDomains(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_domain': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getDomain(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_domain': {
        const params = DomainCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createDomain(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_domain': {
        const params = ComputeResourceUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateDomain(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_domain': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteDomain(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Installation Media Management
      case 'foreman_list_media': {
        const params = MediaListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listMedia(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_medium': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getMedium(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_medium': {
        const params = MediaCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createMedium(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_medium': {
        const params = MediaUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateMedium(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_medium': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteMedium(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Partition Table Management
      case 'foreman_list_partition_tables': {
        const params = PartitionTableListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listPartitionTables(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_partition_table': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getPartitionTable(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_partition_table': {
        const params = PartitionTableCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createPartitionTable(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_partition_table': {
        const params = PartitionTableUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updatePartitionTable(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_partition_table': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deletePartitionTable(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // Operating System Management
      case 'foreman_list_operating_systems': {
        const params = OperatingSystemListSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.listOperatingSystems(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_get_operating_system': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.getOperatingSystem(apiParams.id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_create_operating_system': {
        const params = OperatingSystemCreateSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.createOperatingSystem(apiParams);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_update_operating_system': {
        const params = OperatingSystemUpdateSchema.parse(args);
        const { server, id, ...updateData } = params;
        const client = getClient(server);
        const result = await client.updateOperatingSystem(id, updateData);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'foreman_delete_operating_system': {
        const params = ComputeResourceGetSchema.parse(args);
        const { server, ...apiParams } = params;
        const client = getClient(server);
        const result = await client.deleteOperatingSystem(apiParams.id);
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
  // Silence startup message for Claude Code compatibility
}

main().catch((error) => {
  // Silent exit on server error to avoid corrupting MCP protocol
  // The error will be visible in the MCP logs
  process.exit(1);
});
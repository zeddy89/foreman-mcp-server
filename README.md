# Foreman MCP Server

An MCP (Model Context Protocol) server that provides natural language access to Foreman API endpoints.

## Features

- Complete coverage of major Foreman API endpoints
- Natural language processing for common operations
- Support for host, content view, repository, and organization management
- Task monitoring and management
- Secure authentication handling

## Installation

```bash
cd foreman-mcp-server
npm install
npm run build
```

## Configuration

The server can be configured using either environment variables or a configuration file.

### Option 1: Environment Variables

```bash
export FOREMAN_URL="https://your-foreman-instance.com"
export FOREMAN_USERNAME="your-username"
export FOREMAN_TOKEN="your-personal-access-token"
```

### Option 2: Configuration File (Single Server)

Create a `foreman-config.json` file in the project root:

```json
{
  "baseUrl": "https://your-foreman-instance.com",
  "username": "your-username",
  "token": "your-personal-access-token"
}
```

### Option 3: Configuration File (Multiple Servers)

To support multiple Foreman/Satellite servers, use this format:

```json
{
  "servers": {
    "foreman": {
      "baseUrl": "https://your-foreman-server.com",
      "username": "foreman-admin",
      "token": "foreman-token"
    },
    "satellite": {
      "baseUrl": "https://your-satellite-server.com",
      "username": "satellite-admin",
      "token": "satellite-token"
    },
    "dev": {
      "baseUrl": "https://dev-foreman.example.com",
      "username": "dev-admin",
      "token": "dev-token"
    }
  },
  "defaultServer": "foreman"
}
```

**Note**: The configuration file is ignored by git for security. Never commit credentials.

### Generating a Personal Access Token

To generate a Personal Access Token in Foreman:
1. Log in to your Foreman instance
2. Navigate to your user account settings
3. Go to the "Personal Access Tokens" section
4. Create a new token with appropriate permissions

Note: The token is used as the password in HTTP Basic authentication with your username.

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "foreman": {
      "command": "node",
      "args": ["/path/to/foreman-mcp-server/dist/index.js"],
      "env": {
        "FOREMAN_URL": "https://your-foreman-instance.com",
        "FOREMAN_USERNAME": "your-username",
        "FOREMAN_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

## Available Tools

All tools support an optional `server` parameter to specify which server to use. If not specified, the default server is used.

### Host Management
- `foreman_list_hosts` - List all hosts with optional filters
- `foreman_get_host` - Get detailed information about a specific host
- `foreman_create_host` - Create a new host
- `foreman_update_host` - Update an existing host
- `foreman_delete_host` - Delete a host
- `foreman_power_host` - Perform power management actions (start, stop, reboot, etc.)

### Content View Management
- `foreman_list_content_views` - List all content views
- `foreman_get_content_view` - Get detailed information about a content view
- `foreman_create_content_view` - Create a new content view
- `foreman_publish_content_view` - Publish a new version of a content view

### Repository Management
- `foreman_list_repositories` - List all repositories
- `foreman_create_repository` - Create a new repository
- `foreman_sync_repository` - Synchronize a repository

### Organization Management
- `foreman_list_organizations` - List all organizations
- `foreman_create_organization` - Create a new organization

### Task Management
- `foreman_list_tasks` - List Foreman tasks with filters for state and result

### Provisioning Tools

#### Installation Media
- `foreman_list_media` - List all installation media
- `foreman_get_medium` - Get details of an installation medium
- `foreman_create_medium` - Create a new installation medium
- `foreman_update_medium` - Update an installation medium
- `foreman_delete_medium` - Delete an installation medium

#### Partition Tables
- `foreman_list_partition_tables` - List all partition tables
- `foreman_get_partition_table` - Get details of a partition table
- `foreman_create_partition_table` - Create a new partition table
- `foreman_update_partition_table` - Update a partition table
- `foreman_delete_partition_table` - Delete a partition table

#### Operating Systems
- `foreman_list_operating_systems` - List all operating systems
- `foreman_get_operating_system` - Get details of an operating system
- `foreman_create_operating_system` - Create a new operating system
- `foreman_update_operating_system` - Update an operating system
- `foreman_delete_operating_system` - Delete an operating system

## Natural Language Examples

The server includes natural language processing capabilities. You can use phrases like:

- "List all hosts"
- "Show me hosts in organization ACME"
- "Create a host named webserver01"
- "Reboot host database01"
- "Publish content view production-cv"
- "Sync repository centos-base"
- "List running tasks"
- "Show failed tasks"

## Using Multiple Servers

When you have multiple servers configured, you can specify which server to use:

### Using Tool Parameters
```javascript
// List hosts from the satellite server
foreman_list_hosts({ server: "satellite" })

// Create a host on the dev server
foreman_create_host({ 
  server: "dev",
  name: "test-host",
  organization_id: "1",
  location_id: "1"
})

// Query different servers
foreman_list_organizations({ server: "foreman" })
foreman_list_organizations({ server: "satellite" })
```

### Natural Language with Server Specification
- "List all hosts on the satellite server"
- "Show me content views from the dev server"
- "Create a repository on satellite"

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Security Notes

- Authentication uses Personal Access Tokens (PAT) for enhanced security
- Tokens are passed via environment variables
- All API calls use HTTPS
- SSL certificate verification can be disabled for self-signed certificates
- Never commit tokens or credentials to version control

## Extending the Server

To add new API endpoints:

1. Add methods to `foreman-client.ts`
2. Define tool schemas and handlers in `index.ts`
3. Add natural language patterns to `natural-language.ts`

## Troubleshooting

- Ensure Foreman API v2 is accessible at the configured URL
- Verify credentials have appropriate permissions
- Check that the Foreman instance allows API access from your IP
- The server automatically handles self-signed SSL certificates
- For additional SSL debugging, you may set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production)
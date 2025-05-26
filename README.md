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

Set the following environment variables:

```bash
export FOREMAN_URL="https://your-foreman-instance.com"
export FOREMAN_USERNAME="your-username"
export FOREMAN_PASSWORD="your-password"
```

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
        "FOREMAN_PASSWORD": "your-password"
      }
    }
  }
}
```

## Available Tools

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

- Credentials are passed via environment variables
- All API calls use HTTPS
- Basic authentication is used for API access
- Never commit credentials to version control

## Extending the Server

To add new API endpoints:

1. Add methods to `foreman-client.ts`
2. Define tool schemas and handlers in `index.ts`
3. Add natural language patterns to `natural-language.ts`

## Troubleshooting

- Ensure Foreman API v2 is accessible at the configured URL
- Verify credentials have appropriate permissions
- Check that the Foreman instance allows API access from your IP
- For SSL issues, you may need to set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production)
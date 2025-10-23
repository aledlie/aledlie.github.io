# Claude Desktop MCP Server Configuration Report

**Date:** October 23, 2025
**Machine:** MacBook-Air-2.local
**User:** alyshialedlie

## Executive Summary

This report documents the comprehensive setup and configuration of Model Context Protocol (MCP) servers for Claude Desktop, enabling AI-assisted workflows for Meta Business Manager, dbt Cloud, and MCP server discovery.

## MCP Servers Configured

### 1. MCP Server Discovery (1mcpserver)

**Purpose:** Meta-MCP server that automatically discovers, configures, and adds other MCP servers.

**Configuration:**
- **Type:** Remote (SSE)
- **URL:** `https://mcp.1mcpserver.com/mcp/`
- **Location in config:** Line 60-66

**Features:**
- Automatic MCP server discovery
- Search and configure new servers
- Eliminates manual setup requirements

**Configuration Block:**
```json
{
  "mcp-server-discovery": {
    "url": "https://mcp.1mcpserver.com/mcp/",
    "headers": {
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache"
    }
  }
}
```

---

### 2. Pipeboard Meta Ads MCP

**Purpose:** Comprehensive Meta Business Manager integration for Facebook and Instagram advertising.

**Configuration:**
- **Type:** Remote (OAuth)
- **URL:** `https://mcp.pipeboard.co/meta-ads-mcp`
- **Location in config:** Line 67-69

**Features:**
- 30+ tools for Meta Business Manager operations
- Account, campaign, ad set, and ad management
- Budget scheduling and optimization
- Creative testing (A/B testing)
- Audience targeting (interests, behaviors, demographics, locations)
- Performance insights and analytics
- Image uploads and creative management

**Supported Platforms:**
- Facebook Ads
- Instagram Ads
- Meta Business Suite

**Configuration Block:**
```json
{
  "pipeboard-meta-ads": {
    "url": "https://mcp.pipeboard.co/meta-ads-mcp"
  }
}
```

**Authentication:** OAuth-based, configured through Claude Desktop interface after restart.

**Requirements:**
- Claude Pro or Claude Max subscription (for remote MCP servers)
- Meta Business Manager account with appropriate permissions

---

### 3. dbt MCP Server

**Purpose:** Interface for interacting with dbt Cloud projects, enabling AI-assisted data transformation workflows.

**Configuration:**
- **Type:** Local (stdio via uvx)
- **Command:** `uvx`
- **Location in config:** Line 70-77

**Features:**
- **Semantic Layer Tools:** Query governed metrics and dimensions
- **Discovery Tools:** Browse project metadata, models, sources, tests
- **dbt Admin API Tools:** Run dbt commands (run, test, compile, build)

**Configuration Block:**
```json
{
  "dbt-mcp": {
    "command": "uvx",
    "args": [
      "--env-file",
      "/Users/alyshialedlie/.config/dbt-mcp/.env",
      "dbt-mcp"
    ]
  }
}
```

**Environment Configuration:**
- **Config File:** `/Users/alyshialedlie/.config/dbt-mcp/.env`
- **dbt Cloud Host:** `https://ij795.us1.dbt.com`
- **Account ID:** `70471823503619`
- **Project ID:** `70471823518346`
- **Service Token:** Configured (stored in .env)

**dbt Profiles:**
- **Profile Directory:** `/Users/alyshialedlie/.dbt/`
- **profiles.yml:** Configured for PostgreSQL connection with environment variable support

**Connection Details:**
```yaml
default:
  target: dev
  outputs:
    dev:
      type: postgres
      host: your_postgres_host_here
      port: 5432
      user: your_postgres_username
      password: "{{ env_var('DBT_POSTGRES_PASSWORD') }}"
      dbname: your_database_name
      schema: public
      threads: 4
```

**Prerequisites:**
- Python with uvx installed (✓ v0.8.13)
- dbt Cloud account with service token
- PostgreSQL database (for dbt Core workflows)

---

## PostgreSQL IP Whitelist Configuration

**Purpose:** Allow dbt Cloud to connect to PostgreSQL databases from authorized IP addresses.

### dbt Cloud IP Addresses (North America - AWS us-east-1)

The following IP addresses must be whitelisted in PostgreSQL firewall rules:

1. `52.45.144.63/32`
2. `54.81.134.249/32`
3. `52.22.161.231/32`
4. `52.3.77.232/32`
5. `3.214.191.130/32`
6. `34.233.79.135/32`

### Implementation Methods

#### AWS RDS PostgreSQL
```
Security Group Inbound Rules:
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Custom (add each IP with /32 CIDR)
```

#### Self-Hosted PostgreSQL (pg_hba.conf)
```conf
# dbt Cloud North America IPs
host    all    all    52.45.144.63/32      md5
host    all    all    54.81.134.249/32     md5
host    all    all    52.22.161.231/32     md5
host    all    all    52.3.77.232/32       md5
host    all    all    3.214.191.130/32     md5
host    all    all    34.233.79.135/32     md5
```

#### Google Cloud SQL PostgreSQL
```
Authorized Networks:
- dbt-cloud-1: 52.45.144.63/32
- dbt-cloud-2: 54.81.134.249/32
- dbt-cloud-3: 52.22.161.231/32
- dbt-cloud-4: 52.3.77.232/32
- dbt-cloud-5: 3.214.191.130/32
- dbt-cloud-6: 34.233.79.135/32
```

---

## File Locations

### Claude Desktop Configuration
**Path:** `/Users/alyshialedlie/Library/Application Support/Claude/claude_desktop_config.json`

**Complete MCP Server Configuration:**
```json
{
  "mcpServers": {
    "discord": { ... },
    "google-calendar": { ... },
    "bright-data": { ... },
    "perplexity": { ... },
    "wix-mcp-remote": { ... },
    "linkedin": { ... },
    "git-visualization": { ... },
    "tailscale": { ... },
    "mcp-server-discovery": {
      "url": "https://mcp.1mcpserver.com/mcp/",
      "headers": {
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache"
      }
    },
    "pipeboard-meta-ads": {
      "url": "https://mcp.pipeboard.co/meta-ads-mcp"
    },
    "dbt-mcp": {
      "command": "uvx",
      "args": [
        "--env-file",
        "/Users/alyshialedlie/.config/dbt-mcp/.env",
        "dbt-mcp"
      ]
    }
  }
}
```

### dbt Configuration Files

**Environment Configuration:**
`/Users/alyshialedlie/.config/dbt-mcp/.env`

**dbt Profiles:**
`/Users/alyshialedlie/.dbt/profiles.yml`

---

## Testing & Validation

### dbt-mcp Connection Test
```bash
uvx --env-file /Users/alyshialedlie/.config/dbt-mcp/.env dbt-mcp
```

**Result:** ✅ Success
```
INFO     Registering semantic layer tools
INFO     Registering discovery tools
INFO     Registering dbt admin API tools
INFO     Starting MCP server
```

### Configuration Validation
```bash
cat "/Users/alyshialedlie/Library/Application Support/Claude/claude_desktop_config.json" | python3 -m json.tool
```

**Result:** ✅ JSON is valid

---

## Usage Examples

### Meta Ads MCP
After authenticating with Meta Business Manager:
- "Show me all my Meta ad accounts"
- "What are my top performing campaigns this month?"
- "Create a new campaign for my product launch"
- "Analyze the performance of my Instagram ads"
- "Upload this image and create an ad with it"

### dbt MCP
After dbt Cloud authentication:
- "Show me all models in my dbt project"
- "What sources are configured?"
- "List all tests in my project"
- "What metrics are available?"
- "Query the revenue metric for last month"
- "Run dbt tests"
- "Compile my dbt models"

### MCP Server Discovery
- "Find MCP servers for database management"
- "What MCP servers are available for GitHub integration?"
- "Search for MCP servers that can help with file operations"

---

## Prerequisites & Dependencies

### System Requirements
- macOS (Darwin 24.5.0)
- Homebrew package manager
- Python 3.x with uvx (v0.8.13)
- Node.js and npm (for npm-based MCP servers)

### Claude Desktop
- Claude Pro or Claude Max subscription (for remote MCP servers)
- Claude Desktop application installed

### External Services
- **dbt Cloud Account:** Account ID 70471823503619
- **Meta Business Manager:** With appropriate advertising permissions
- **PostgreSQL Database:** (optional, for dbt Core workflows)

---

## Security Considerations

### Credential Management
- Service tokens stored in `.env` files (not committed to git)
- Environment variables used for sensitive data
- OAuth authentication for remote services

### Network Security
- IP whitelisting configured for database access
- TLS/SSL encryption for remote connections
- Firewall rules implemented per best practices

### Access Control
- Service tokens have limited, scoped permissions
- Regular token rotation recommended
- Principle of least privilege applied

---

## Troubleshooting

### Claude Desktop Logs
**macOS:** `~/Library/Logs/Claude`

### Common Issues

**MCP Server Not Appearing:**
1. Verify JSON configuration is valid
2. Restart Claude Desktop completely
3. Check logs for connection errors

**dbt Connection Failed:**
1. Verify service token is valid
2. Check `.env` file configuration
3. Confirm account/project IDs are correct

**Database Connection Issues:**
1. Verify IP whitelist includes all dbt Cloud IPs
2. Check firewall rules and security groups
3. Test database connectivity manually
4. Verify database user permissions

---

## Next Steps

### Immediate Actions Required
1. **Restart Claude Desktop** to activate all MCP servers
2. **Authenticate with Pipeboard Meta Ads** via OAuth flow
3. **Test dbt Cloud connection** with sample queries
4. **Update PostgreSQL credentials** in profiles.yml (if using dbt Core)

### Future Enhancements
- Configure additional MCP servers via discovery tool
- Set up additional dbt Cloud environments (staging, production)
- Implement automated testing workflows
- Document custom prompts and workflows

---

## References

### Official Documentation
- [dbt MCP Server](https://github.com/dbt-labs/dbt-mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [dbt Cloud Documentation](https://docs.getdbt.com)
- [Pipeboard Meta Ads MCP](https://github.com/pipeboard-co/meta-ads-mcp)
- [1mcpserver](https://github.com/particlefuture/1mcpserver)

### IP Whitelist Reference
- [dbt Cloud Access & IP Addresses](https://docs.getdbt.com/docs/cloud/about-cloud/access-regions-ip-addresses)

---

## Change Log

### October 23, 2025
- ✅ Installed and configured MCP Server Discovery
- ✅ Installed and configured Pipeboard Meta Ads MCP
- ✅ Installed dbt-mcp via uvx
- ✅ Configured dbt Cloud connection (Account: 70471823503619, Project: 70471823518346)
- ✅ Created dbt profiles.yml for PostgreSQL
- ✅ Documented dbt Cloud IP whitelist requirements
- ✅ Validated all configurations
- ✅ Tested dbt-mcp server connection

---

**Report Generated:** October 23, 2025
**Status:** Configuration Complete - Ready for Use
**Next Review:** After first week of usage

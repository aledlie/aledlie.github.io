# Doppler Secrets Management

This project uses [Doppler](https://www.doppler.com/) to manage secrets and API keys instead of hardcoding them in configuration files.

## Why Doppler?

- **Security**: Keeps secrets out of version control
- **Flexibility**: Easy to rotate keys without code changes
- **Environment Management**: Separate configs for dev/staging/production
- **Team Collaboration**: Secure secret sharing across team members

## Setup

### First-Time Setup

1. **Run the setup script:**
   ```bash
   ./utils/setup-doppler.sh
   ```

   This will:
   - Authenticate you with Doppler (opens browser)
   - Create the `personal-site` project
   - Add all secrets (GTM ID, site verification, etc.)
   - Set up both `dev` and `prd` configs

2. **Verify setup:**
   ```bash
   doppler secrets
   ```

   You should see:
   ```
   GOOGLE_TAG_MANAGER_ID=GTM-TK5J8L38
   GOOGLE_SITE_VERIFICATION=N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM
   SITE_URL=https://www.aledlie.com
   GITHUB_REPOSITORY=aledlie/aledlie.github.io
   ```

### Manual Setup

If you prefer manual setup:

```bash
# 1. Login
doppler login

# 2. Create project
doppler projects create personal-site

# 3. Setup locally
doppler setup --project personal-site --config dev

# 4. Add secrets
doppler secrets set GOOGLE_TAG_MANAGER_ID="GTM-TK5J8L38"
doppler secrets set GOOGLE_SITE_VERIFICATION="N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM"
doppler secrets set SITE_URL="https://www.aledlie.com"
doppler secrets set GITHUB_REPOSITORY="aledlie/aledlie.github.io"
```

## Usage

### Local Development

```bash
# Serve Jekyll with Doppler secrets
doppler run -- RUBYOPT="-W0" bundle exec jekyll serve

# Build with Doppler secrets
doppler run -- bundle exec jekyll build

# Run tests with Doppler secrets
doppler run -- npm run test:all
```

### Jekyll Configuration

The `_config.yml` file uses environment variables that Doppler provides:

```yaml
# _config.yml
google_site_verification: <%= ENV['GOOGLE_SITE_VERIFICATION'] %>
analytics:
  provider: "google-gtag"
  google:
    tracking_id: <%= ENV['GOOGLE_TAG_MANAGER_ID'] %>
    anonymize_ip: true
```

**Note:** Jekyll doesn't natively support ERB templates in `_config.yml`. We use a preprocessor script to inject Doppler secrets before builds.

### Environment Switching

```bash
# Use development secrets
doppler run --config dev -- bundle exec jekyll serve

# Use production secrets
doppler run --config prd -- bundle exec jekyll build
```

## Secrets Managed

Current secrets in Doppler:

| Secret | Purpose | Environment |
|--------|---------|-------------|
| `GOOGLE_TAG_MANAGER_ID` | Google Tag Manager tracking ID | dev, prd |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification | dev, prd |
| `SITE_URL` | Primary site URL | dev, prd |
| `GITHUB_REPOSITORY` | GitHub repository identifier | dev, prd |

## Adding New Secrets

```bash
# Add a new secret
doppler secrets set NEW_SECRET="value"

# Add to production too
doppler secrets set NEW_SECRET="value" --config prd

# View all secrets
doppler secrets

# Delete a secret
doppler secrets delete SECRET_NAME
```

## CI/CD Integration

### GitHub Actions

Add Doppler token to GitHub repository secrets:

1. Generate a service token in Doppler dashboard
2. Add to GitHub: Settings → Secrets → New repository secret
3. Name: `DOPPLER_TOKEN`

Then in your workflow:

```yaml
- name: Install Doppler CLI
  run: |
    curl -Ls https://cli.doppler.com/install.sh | sh

- name: Build site with secrets
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
  run: doppler run -- bundle exec jekyll build
```

### Vercel

Add Doppler integration in Vercel dashboard:

1. Project Settings → Integrations → Doppler
2. Connect your Doppler project
3. Select `prd` config for production
4. Secrets automatically injected

## Security Best Practices

1. **Never commit `.doppler.yaml`** - This file contains project config and is in `.gitignore`
2. **Rotate secrets regularly** - Easy with Doppler, update in one place
3. **Use separate configs** - Different secrets for dev/staging/production
4. **Audit access** - Review who has access to secrets in Doppler dashboard
5. **Service tokens** - Use service tokens for CI/CD, not personal tokens

## Troubleshooting

### "Command not found: doppler"

Install Doppler CLI:
```bash
brew install dopplerhq/cli/doppler
```

### "Not logged in"

```bash
doppler login
```

### "Project not found"

```bash
doppler setup --project personal-site --config dev
```

### Secrets not loading

```bash
# Verify Doppler is working
doppler secrets

# Check current project
doppler configure get

# Manually set project
doppler setup
```

## Migration from Hardcoded Secrets

Original hardcoded values have been moved to Doppler:

- ✅ `analytics.google.tracking_id` → `GOOGLE_TAG_MANAGER_ID`
- ✅ `google_site_verification` → `GOOGLE_SITE_VERIFICATION`
- ✅ `url` → `SITE_URL`
- ✅ `repository` → `GITHUB_REPOSITORY`

The `_config.yml` file can now be safely committed without exposing secrets.

## Resources

- [Doppler Documentation](https://docs.doppler.com/)
- [Doppler CLI Reference](https://docs.doppler.com/docs/cli)
- [Jekyll Environment Variables](https://jekyllrb.com/docs/configuration/environments/)

## Support

For Doppler issues:
- [Doppler Support](https://support.doppler.com/)
- [Doppler Community Slack](https://www.doppler.com/community)

For project-specific questions:
- Check existing documentation in `/documentation/`
- Review `CLAUDE.md` for project overview

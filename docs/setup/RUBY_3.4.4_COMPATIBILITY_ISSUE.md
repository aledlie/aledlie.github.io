# Ruby 3.4.4 Compatibility Issue

**Status:** BLOCKING
**Impact:** HIGH - Prevents Jekyll build
**Date Identified:** 2025-11-11

## Problem

Jekyll build fails with Ruby 3.4.4 due to two compatibility issues:

### Issue 1: SSL Certificate Verification (Remote Theme)

```
SSL_connect returned=1 errno=0 peeraddr=140.82.112.9:443 state=error:
certificate verify failed (unable to get certificate CRL)
```

**Root Cause:** Ruby 3.4.4 has stricter SSL certificate handling that conflicts with downloading remote themes from GitHub.

**Workaround Applied:** Commented out `remote_theme` in `_config.yml` to use local theme gem.

### Issue 2: SASS RGB Function Arguments (Primary Issue)

```
Error: wrong number of arguments (1 for 3)
/path/to/sass-3.7.4/lib/sass/script/functions.rb:654:in `rgb'
```

**Root Cause:** The `sass` gem (3.7.4) bundled with `jekyll-sass-converter` 1.5.2 is incompatible with Ruby 3.4.4's handling of the `rgb()` function.

**Why This Matters:**
- `github-pages` gem requires `jekyll-sass-converter` 1.5.2
- Version 1.5.2 uses the old `sass` gem
- The old `sass` gem is incompatible with Ruby 3.4.4
- Upgrading to `jekyll-sass-converter` 2.x (which uses `sassc`) breaks `github-pages` compatibility

## Solutions

### Option 1: Downgrade Ruby (Quickest)

```bash
# Install Ruby 3.3.x
rbenv install 3.3.6
rbenv local 3.3.6

# OR with chruby/ruby-install
ruby-install ruby 3.3.6
chruby ruby-3.3.6

# Reinstall gems
bundle install

# Build site
bundle exec jekyll build
```

**Pros:**
- Quick fix
- Maintains GitHub Pages compatibility
- No code changes needed

**Cons:**
- Doesn't use latest Ruby
- Temporary solution

### Option 2: Patch SASS Gem (Medium Complexity)

Create a monkey patch for the sass gem:

```bash
cat > lib/sass_fix.rb << 'EOF'
# Monkey patch for sass gem Ruby 3.4.4 compatibility
require 'sass/script/functions'

module Sass::Script::Functions
  def rgb(*args)
    # Handle both old style (r, g, b) and new style (color string)
    if args.length == 1 && args[0].is_a?(Sass::Script::Value::String)
      # Parse color string
      color_str = args[0].value
      if color_str =~ /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
        r = $1.to_i(16)
        g = $2.to_i(16)
        b = $3.to_i(16)
        return Sass::Script::Value::Color.new([r, g, b])
      end
    end

    # Fall back to original implementation for 3-argument calls
    super(*args)
  end
end
EOF

# Add to build command
ruby -r./lib/sass_fix.rb -S bundle exec jekyll build
```

**Pros:**
- Keeps Ruby 3.4.4
- Maintains GitHub Pages compatibility
- No gem changes

**Cons:**
- Requires maintenance
- Hacky solution
- May break with updates

### Option 3: Remove GitHub Pages Gem (Most Changes)

```ruby
# Gemfile
source "https://rubygems.org"

# Remove: gem 'github-pages', group: :jekyll_plugins

# Add individual gems
gem 'jekyll', '~> 4.3'
gem 'jekyll-sass-converter', '~> 3.0'  # Uses sassc/sass-embedded
gem 'minimal-mistakes-jekyll'

# ... rest of plugins
```

**Pros:**
- Uses modern Jekyll and SASS
- Ruby 3.4.4 compatible
- Better performance (sassc is faster)

**Cons:**
- Breaks GitHub Pages auto-build
- Need manual deployment via GitHub Actions
- More complex CI/CD setup

### Option 4: Use Vercel Only (Deployment Change)

Since the site already has Vercel configuration:

1. Remove GitHub Pages gem
2. Upgrade to modern Jekyll/SASS
3. Use Vercel as primary deployment
4. DNS points to Vercel instead of GitHub Pages

**Pros:**
- Modern stack
- Ruby 3.4.4 compatible
- Vercel has better performance

**Cons:**
- Changes deployment strategy
- No longer using GitHub Pages

## Recommendation

**For Immediate Refactoring:** Use Option 1 (downgrade to Ruby 3.3.6)

**For Long-Term:** Use Option 4 (Vercel-only with modern stack) during Phase 3 of refactoring

## Implementation Plan

### Phase 0 (Current): Quick Fix

```bash
# 1. Downgrade Ruby
rbenv install 3.3.6
rbenv local 3.3.6

# 2. Reinstall dependencies
bundle install
npm install

# 3. Verify build works
bundle exec jekyll build

# 4. Continue with refactoring
```

### Phase 3 (Deployment Simplification): Permanent Fix

During Phase 3 of the refactoring plan:

1. Remove `github-pages` gem
2. Upgrade to `jekyll` 4.x
3. Upgrade to `jekyll-sass-converter` 3.x (uses `sass-embedded`)
4. Configure Vercel as primary deployment
5. Update DNS to point to Vercel
6. Document new deployment process

## Testing

After applying fix:

```bash
# 1. Build should succeed
bundle exec jekyll build

# 2. Serve locally
RUBYOPT="-W0" bundle exec jekyll serve

# 3. Visit http://localhost:4000
# 4. Verify styling is correct
```

## Related Issues

- [Jekyll Issue #9220](https://github.com/jekyll/jekyll/issues/9220) - Ruby 3.4 compatibility
- [Sass Issue #434](https://github.com/sass/ruby-sass/issues/434) - rgb function
- GitHub Pages uses fixed Jekyll/gem versions for consistency

## Status Updates

- **2025-11-11:** Issue identified, blocking Phase 0 refactoring
- **Awaiting:** User decision on which solution to implement

## Next Steps

1. User chooses solution (recommend Option 1 for now)
2. Apply fix
3. Verify site builds
4. Continue with Phase 0: Baseline Metrics

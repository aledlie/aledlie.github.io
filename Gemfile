source "https://rubygems.org"

# Note: Removed github-pages gem to allow modern Sass compiler
# This site deploys to GitHub Pages via GitHub Actions
gem "jekyll", "~> 4.3"
gem "jekyll-include-cache", group: :jekyll_plugins

# Explicitly include csv and logger for Ruby 3.4.4
gem "csv"
gem "logger"
gem "webrick"
gem "base64"
gem 'public_suffix', '~> 5.1.1'
gem 'font-awesome-sass'
gem 'faraday-retry'

#plugins
plugin 'bundler-graph'

# Theme
gem 'minimal-mistakes-jekyll'

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
  gem 'jekyll-sass-converter', '~> 3.0'  # Modern Sass compiler support
  gem "jekyll-paginate"
  gem "jekyll-sitemap"
  gem "jekyll-gist"
end

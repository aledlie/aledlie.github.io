require 'redcarpet'

module Jekyll
  module RedcarpetFilter
    def markdown(text)
      options = {
        hard_wrap: true,
        filter_html: true,
        autolink: true,
        no_intra_emphasis: true,
        fenced_code_blocks: true,
        space_after_headers: true
      }
      renderer = Redcarpet::Render::HTML.new(options)
      markdown = Redcarpet::Markdown.new(renderer, extensions = {})
      markdown.render(text)
    end
  end
end

Liquid::Template.register_filter(Jekyll::RedcarpetFilter)

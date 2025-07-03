---
layout: single
title: Learn How To Make Personal Websites For Free
subtitle: And fast and easy (mostly!)
permalink: /
author_profile: true
---

### It also serves as a reminder to me of everything I used here to build my own :)

---

## Links To Tools You Can Use:
### Don't Worry, you don't have to use/learn all of them 

[Jekyll]: https://jekyllrb.com
[Markdown]: https://daringfireball.net/projects/markdown/
[My Favorite Markdown]: https://github.com/vmg/redcarpet 
[Liquid]: https://github.com/Shopify/liquid/wiki
[Front matter]: https://jekyllrb.com/docs/front-matter/
[Jekyll configuration]: https://jekyllrb.com/docs/configuration/
[source file for this page]: https://github.com/aledlie/aledlie.github.io/blob/master/index.md
[A List of Free Templates]: https://cloudcannon.com/blog/free-jekyll-themes-for-2025/
[GitHub Pages]: https://pages.github.com/
[GitHub Pages / Actions workflow]: https://github.blog/changelog/2022-07-27-github-pages-custom-github-actions-workflows-beta/


## Recent Posts
{% for post in site.posts limit:5 %}
- [{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%B %d, %Y" }}
{% endfor %}

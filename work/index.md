---
layout: single
title: "What Do You Do?"
permalink: /work/
author_profile: true
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
---

A chronological collection of what I'm working on, projects I've built, and things I'm learning. Newest updates first.

---

{% assign work_posts = site.work | sort: 'date' | reverse %}
{% for post in work_posts %}
  <article class="archive__item">
    <h2 class="archive__item-title">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>
    {% if post.date %}
      <p class="archive__item-date">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>
      </p>
    {% endif %}
    {% if post.excerpt %}
      <p class="archive__item-excerpt">{{ post.excerpt | markdownify | strip_html | truncate: 160 }}</p>
    {% endif %}
  </article>
{% endfor %}

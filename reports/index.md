---
layout: single
title: "Case Studies"
permalink: /reports/
author_profile: true
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

Technical reports, case studies, and detailed analyses of projects and implementations. Newest reports first.

---

{% assign report_posts = site.reports | sort: 'date' | reverse %}
{% for post in report_posts %}
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

---
layout: single
title: "What Do You Do?"
permalink: /work/
author_profile: true
classes: wide
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
---

A chronological collection of what I'm working on, projects I've built, and things I'm learning. Newest updates first.

---

{% assign entries = site.work | sort: 'date' | reverse %}
<div class="entries-list">
{% for post in entries %}
  {% include archive-single.html type="list" %}
{% endfor %}
</div>

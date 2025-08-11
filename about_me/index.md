---
layout: single
title: Shower Thoughts
subtitle: true
author_profile: true
description: true
header:
  overlay_image: /images/cover-home.png
  teaser: /images/cover-home.png
---
This started the way most interesting things do: not with a plan, but with a pattern. Around 2 a.m., long after a twilight hush had wrapped the world in quiet, a certain kind of idea would show up - stray tangents, shower arguments, metaphysical quandries - and start demanding sandwiches with the crusts cut off and somewhere to sit.  They were uninvited, underdressed, and annoyingly persistent.  Although rarely brilliant, they were never boring. They'd linger.  Argue.  Sometimes even make a point.

So I gave them a room: something between a study, a speakeasy, and a holding pen for mental clutter that occationally surprises you by being useful.

This isn't a manifesto or a master plan.  Some of what happens here might sound like philosophy, or psychology, or the kind of essay people write when they’ve read too much Kierkegaard and slept too little. But mostly, it’s just me trying to make sense of things the way anyone does: slowly, sideways, and often out loud. You won’t find answers here. But you might find a kind of comfort in the questions, or at least some company in the confusion.

Come in. The fire’s on, and the tea's ready. The thoughts are restless. Let's see where they take us. 

## Recent Posts
{% for post in site.posts limit:5 %}
- [{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%B %d, %Y" }}
{% endfor %}

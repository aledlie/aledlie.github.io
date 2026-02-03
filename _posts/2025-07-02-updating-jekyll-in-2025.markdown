---
layout: single
title: "Updating a jekyll page after 8 years"
date: 2025-07-02
author_profile: true
categories:
  - Jekyll
  - Web Development
tags:
  - jekyll
  - ruby
  - bundler
  - static-site-generator
  - tutorial
excerpt: "A guide to updating Jekyll after 8 years - from 2017 setup to 2025 best practices"

# Enhanced Schema.org structured data
schema_type: TechArticle
schema_dependencies: "Ruby 3.x, Jekyll 4.x, Bundler 2.x"
schema_proficiency: "Intermediate"
schema_section: "Jekyll"
schema_about: "Jekyll Static Site Generator"

# Entity mentions - technologies and tools discussed
schema_mentions:
  - name: "Jekyll"
    type: "SoftwareApplication"
    url: "https://jekyllrb.com/"
  - name: "Ruby"
    type: "ComputerLanguage"
    url: "https://www.ruby-lang.org/"
  - name: "Bundler"
    type: "SoftwareApplication"
    url: "https://bundler.io/"
  - name: "Minimal Mistakes"
    type: "SoftwareApplication"
    url: "https://github.com/mmistakes/minimal-mistakes"
  - name: "macOS"
    type: "OperatingSystem"
    url: "https://www.apple.com/macos/"
  - name: "Ubuntu"
    type: "OperatingSystem"
    url: "https://ubuntu.com/"

# Citation - expert resource referenced
schema_citation:
  name: "Moncef Belyamani"
  url: "https://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/"
---

Welcome to the personal website I built back in 2017, over about 20 minutes on a Sunday.
If you'd like to know how easy the setup was on Ubuntu in 2017, here's what it was like:
***


1.  Upgraded Ruby to version 2.1.1 to be compatible with clang.
    
2.  Downloaded and installed [Jekyll](http://jekyllrb.com/).
    
3.  Downloaded and installed the [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes/blob/master/theme-setup/index.md) theme.
    
4.  Modified the images in the /images folder to be smaller in height to save vertical real estate (first installed imagemagick):
    
         $ mogrify -crop 100%x40%+0+0 sample-image-?.jpg
        
    
5.  Installed the octopress gem:
    
         $ gem install octopress
        
    
6.  Made this post with octopress:
    
         $ octopress new post "How I Set Up This Site" 


Now, here's what it looks like to set up on post-2020 Mac (with an M1 or M2 chip) in 2025: 

```
            ,--.
           /-__ \
          |\
   |          |\\\\/|D
          = \  //
      __=--`-\\_
--,__
     /#######\   \###`\
    /         \   \|  |
   /   /|      \   \  |
  /   / |       \     |
 /   /  |        \    /
```
***
That's an actual photo from the documentation.  Or at least it should be.  I spent about 10 minutes updating content, and about 1-2 hours getting ruby and macos to play nice together.  Major hattip [Moncef Belyamani](https://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/), whose instructions for debugging this manually were way more helpful than Grok, ChatGPT, and Cursor combined.  Because of his really well-written articles, I spent most of the time updating this reinstalling xcode, which was *actually* a required step.

If you're not already horrifically bored to tears and want to read even more about the struggles I went through to update the tech stack in 2025, you can read my blog post about it here (you're reading it now!).

If you've made it this far and are still reading this right now (why, though!?) and you think [this](https://aphyr.com/posts/342-typing-the-technical-interview) is one of the greatest pieces of satire ever written, please reach out via email or [carrier pidgeon](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers) so we can be friends.  Or [LinkedIn](https://www.linkedin.com/in/alyshia-ledlie-2aa52466/), if you absolutely must.

p.s. Did you know actual carrier pigeon messages are still a thing?  I did not, until I wrote this post.  But it is, actually, [a thing](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers) still.
***


---
layout: post
title:  "How to Write Posts With Redcarpet"
date:   2017-05-14 13:23:43 -0500
categories: jekyll update
---

## My Quick Style Reference for Jekyll/Markdown/Redcarpet

[Git Readme file for Redcarpet](https://github.com/vmg/redcarpet/blob/v3.2.2/README.markdown#and-its-like-really-simple-to-use)

### Code Snippits

Look at me, I'm a php code snippit:

```php?start_inline=true
public static function helloWorld(): string {
  return sprintf("%s %s", "Hello", "World!");
}
#=> returns "Hello World!"
```

##### Moar code highlighting

```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```
 
```python
s = "Python syntax highlighting"
print s
```
 
```
No language indicated, so no syntax highlighting. 
But let's throw in a <b>tag</b>.
```

Can also add inline code snippits with `backticks`.

### Markdown style Quick Reference:

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

[And link formatting](https://www.google.com)

And image resources:
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")


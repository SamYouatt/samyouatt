+++
title = "Site Design"
date = 2000-02-02
+++

## Zola

I wanted something simple so I chose zola.

## Design

I want it to look really nice.

## Colours and Fonts

For the website I want to keep it simple. One because I think it will draw the attention to the main focus of the pages, the content, but also because I don't want to put a lot of effort into it right now.

### Stripey Background

The main visual styling will be a striped motif using the colours from the palette. This could be achieved by creating a background image in an image editing program and then setting that as the background image but I want a bit more control. It's also likely that I'll make tweaks and changes along the way so having something that I can control quickly if the colour palette changes or I decide on a different style will be helpful.

By adding in variables for the start gap and the width of the line, and doing some simple maths to define where colours should start and end, I can now easily control where I want the lines and how they should look. The embed below can be edited to see the effect changing these values has.

<div class="codepen-container"><p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="css,result" data-slug-hash="OJjKEGa" data-editable="true" data-user="sam-youatt" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/sam-youatt/pen/OJjKEGa">
  Untitled</a> by Sam Youatt (<a href="https://codepen.io/sam-youatt">@sam-youatt</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
</div>

### Animating Underlines

Small animations in key areas can bring a lot of polish to a site, one of these I always enjoy is when hovering on elements are animated. Since my home screen is very minimal I need some way to let the user know that the headings actually take you somewhere. The de facto design signal for this on the web is an underline so that's what will get animated.

The animation should be kept simple and incorporate the main colours of the site. So why not have the underline utilise the striped motif as well.

This effect can be achieved in pure CSS, by taking advantage of the `after` pseudoclass.

`after` creates an extra element immediately after the specified class, which can then have all the normal CSS styling applied. To achieve the stripey underline this pseudoclass will have its background set to stripes. By controlling the height of this class we can control how thick the underline is, and by animating its width we can achieve the effect of the underline sliding in and out. Let's have a look.

<div class="codepen-container">
<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="css,result" data-slug-hash="XWerqxx" data-editable="true" data-user="sam-youatt" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/sam-youatt/pen/XWerqxx">
  Untitled</a> by Sam Youatt (<a href="https://codepen.io/sam-youatt">@sam-youatt</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
</div>

---

Looking at the finished product is has become apparent that, without any ill will or intent on my part, I have essentially created [Polaroid](https://uk.polaroid.com/).

Imitation is the best form of flattery and so forth I suppose.

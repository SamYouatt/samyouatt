+++
title = "Site Design"
date = 2021-12-05
description = "Where am I going to put all of these posts if I don't have a website? Best fix that..."
+++

I'd previously tried my hand with a [Udemy](!TODO) course on web development. It used React and Express to create a website for finding campsites. It was good, I finished it and thought it was about time I had a personal website.

From my exposure to developers on social media it seemed like an essential step in my young developer life to have a website where I could show off my story and skills. This was about one year ago from this post and it just fizzled out.

Using Express and React to serve what was essentially a glorified PDF gave me a lot of struggles, too much unnecessary fiddling to get a product I was happy with. It was also through social media I saw people mention static sites, often used for blogging or hosting project information. It sounded like just what I wanted, write any content in markdown and have your templates do the hard work for you. Plus you get the speed of a static site without the hassle of having to write all your content directly in HTML.

## Zola Señorita

Also pushed on me by the social media machine was Rust, and if you had no idea about the context of the language you would think it was the second coming of the Lord. In my eyes its just a more modern version of C or C++, which is by no means a bad thing and is unfairly simplifying the benefits Rust provides. But this isn't going to be a post about Rust, instead about something *made in Rust*.

[Zola](getzola.net) is a static site generator, you feed it markdown and it generates you your HTML. Exactly what I'm after.

It seems to build on the back of other static site generators but with its own advantages. I have no context for if any of the changes it makes would impact be, but what is important is that it is *made in Rust*.

## Site Setup

I'm not going to detail the full process of setting up a site with Zola, the docs already provide that as well as hour long videos on YouTube. This also isn't supposed to be a tutorial, just a recollection of my experiences that is for my benefit more than any one else's.

Set up was simple though, use `cargo` to install the software, call `zola init` and I was off.

The basic structure that Zola enforces is as follows.

- Static folder, this is where stuff that normally goes to the public folder in a webpage will be grabbed from.
- An optional Sass folder, this is where the sass to be compiled to the css in the public folder will go.
- Content folder, which is where the markdown files that fill out the website will go.
- Templates, maybe the most important, is where you define your HTML templates that get inflated by markdown.

There's going to be three main areas to my site:

1. Blog - guess what goes here...
2. Me - information about myself, like a more personal CV but with a link to a standard CV.
3. Projects - a short list of my main projects at the moment and some of the main things I have achieved and how I would like to improve form there in the future.

To achieve this I just create three folders in the content folder, matching the names above. Each of these will then have an `_index.md` file which serves as the index and base point of that content route. Zola will automatically handle the routing according to the folder names, to `/blog` is automatically filled with the stuff in the blog folder.

## Design

There are a number of Zola themes available, as well as the wide range of CSS libraries like Bootstrap. But I want that bespoke feeling for my website, after all I am supposed to be showing off my *supreme* developer skills, so I am going to handle all the theming and styling myself.

I am going to be using this as an opportunity to use Sass for the first time. There's not much I have to say about my whole experience with SASS having written this website other than that I don't understand why we don't just scrap CSS all together and use SASS from now on.

It offers so many of the powers you have in *actual* programming languages which makes more complex behaviours for styling much easier to implement. Seriously, how are there still not variables in CSS? No going back to CSS for me.

For the website I have a vision. A vision of website devoid of adverts, devoid of distraction, with just the essential content as the star of the show.

Pushing my pretentious inner Steve Jobs-esque designer aside I do want to keep it simple. Part of the reason for this is that it will be much less work, but also because I do want the focus to be on the actual content of the website.

Lots of developers have genius webpages that make use of a range of different trinkets and toys, 3D animations, text based adventures, full Operating system imitations. Given enough time I'm sure I could achieve such heights but I want to get a website spun up quickly, just in time to impress any recruiters currently reading this 👋.

### Colours

General advice for choosing a colour palette is to pick around 3-4 colour, one should be your main brand colour, the others acting as interest and contrast to the main colour. However I don't have a brand colour, I am a person so I have a bit more flexibility. So I'm going to use a spectrum.

I'm also not really a colour expert, in my head I can visualise the perfect site with a gorgeous palette that is striking but sophisticated. Give me half an hour and a colour picker though and I will probably only have ended up with a few shades of brown and a nasty green. As such the colours are likely to change so here's the crazy idea...

Monotone

Not complete monotone, that would be boring. If monotone were so interesting why did we invent colours? Instead it will mostly be black text on white-ish background with a hit of colour, or colours, just as something interesting.

After a lot of thinking and tweaking I have settled on the super simple and easy to implement idea of a spectrum of colours in the form of a stripe. After a while implementing it I realised that [Polaroid](www.polaroid.com) had sort of already made that their thing but hey art is just copying as much as you can get away with anyway.

The colours in the stripe are very subject to change. Cheers SASS for letting me define them as variables.

### Fonts

If the text is going to be the main content of the website then it best look nice. Once again I am not a typography expert, usually just a Arial or Helvetica man. But I need to push myself.

Often times the best designs make use of multiple type faces so I went on the search for some that could work well in different places. I channelled my inner Nick Fury to create a team that could defend the world from any manner of threats, the looming threat of a website formed of Times New Roman and Comic Sans.

The fonts I ended up using and their uses are as follows:

- Poppins: headings.
- Futura Now Headling: logo typography.
- Rubik: body text.
- Source Code Pro: monospace.

Again these may have changed by the time this is read. I can only hope that my elite team has not crumbled though and you're trying to translate this from Wingdings.

One of the main challenges of modern web development is responsive design. Not everyone is reading these posts on my monitor; with my staggering reach it would be infeasible to fit that many people in my flat. People will be using monitors of all shapes and resolutions, tablets, phones, maybe even TVs.

The general trend has been from using fixed units like `px` to responsive units like `vh`, `rem`, etc. Font scaling is also very important. There are a lot of methods for defining font sizes, you could specify font sizes for each class to get a lot of control, or what I have done, define a font size hierarchy initially which will scale well and be used generically across all content.

This hierarchy will make use of the `rem` unit, the root element unit, which looks at the `html` element for the basis font size and then multiplies the value. So for my `html` root size I chose `1.25vh`. This means the root font size will scale as the screen size increases in height. This value took a little bit of tweaking but it works well for the size of text I want.

Next is the hierarchy for basis elements. This means defining the sizes for `h 1-6`, `p`, `a`, etc. The finished product looks as follows:

```SASS
p
    font-size: 1.25rem
    margin: 20px 0px 20px 0px
    line-height: 1.6

h1
    font-weight: 700
    font-size: 5rem
    margin: 50px 0px 25px 0px

h2
    font-weight: 700
    font-size: 3rem
    margin: 50px 0px 15px 0px

h3
    font-size: 2rem
    margin: 40px 0px 15px 0px

a
    color: $element-foreground
    text-decoration-color: $element-background
    font-weight: 500

    &:hover
        text-decoration-color: $element-foreground

ul
    font-size: 1.25rem
    line-height: 1.6

ol
    font-size: 1.25rem
    line-height: 1.6

li
    font-size: 1.25rem
    margin: $medium 0 $medium none
```

Also defined will be default additional properties that should be applied across all instances of these elements, such as colour, margins, and line heights. With this set up I can simply use the appropriate element that would achieve the appearance I want. It's very simple to set up, is responsive, and is super easy to work with.

### Stripey Background

The main visual styling will be a striped motif using the colours from the palette. This could be achieved by creating a background image in an image editing program and then setting that as the background image but I want a bit more control. It's also likely that I'll make tweaks and changes along the way so having something that I can control quickly if the colour palette changes or I decide on a different style will be helpful.

By adding in variables for the start gap and the width of the line, and doing some simple maths to define where colours should start and end, I can now easily control where I want the lines and how they should look. The embed below can be edited to see the effect changing these values has.

{{ codepen(slug="OJjKEGa")}}

This stripe will be shown on the left hand side of the screen on larger displays, but will rotate round to the top of the screen on narrower displays where horizontal space is at a premium.

### Animating Underlines

Small animations in key areas can bring a lot of polish to a site, one of these I always enjoy is when hovering on elements are animated. Since my home screen is very minimal I need some way to let the user know that the headings actually take you somewhere. The de facto design signal for this on the web is an underline so that's what will get animated.

The animation should be kept simple and incorporate the main colours of the site. So why not have the underline utilise the striped motif as well.

This effect can be achieved in pure CSS, by taking advantage of the `after` pseudoclass.

`after` creates an extra element immediately after the specified class, which can then have all the normal CSS styling applied. To achieve the stripey underline this pseudoclass will have its background set to stripes. By controlling the height of this class we can control how thick the underline is, and by animating its width we can achieve the effect of the underline sliding in and out. Let's have a look.

{{ codepen(slug="XWerqxx") }}

### Syntax Highlighting

By default the syntax highlighting offered by Zola is nothing special. There is a snippet offered on the [documentation page](zola code link here) which adds padding and lets the text wrap round so as not to break our poor little phones.

Here is my main area of struggle with Zola, the documentation for this is just not very helpful. I got there in the end but with a little more explantation it could be much better.

Firstly, Zola allows some predefined code themes. You want to know what they are? Tough 🤷

There is no list I can find, so I could sit there and try every combination of character on my keyboard from lengths of 3 to 10 and I might have a reasonably extensive list. Don't think I should have to do that though really. [A list would be nice Zola](https://github.com/getzola/zola/issues/1679).

In the end though I ended up making my own theme, fingers crossed it didn't already exist just with a weird name, based on the [One-Light](link me) theme. I know, I know, but your eyes will surely recover. In the future I would like to implement a dark mode of the website and this will use a dark theme, but I think that light codeblocks will fit in with the light design better for the time being.

Creating my own theme was also a little bit of a pain. There isn't a list of the classes that Zola adds to your code to help you style it so I had to inspect element an already written code block to try and piece them together. If you are finding this and want a list I can save you a bit of time with what I have. It might not be all of them. The rest could be hiding, they could be any of us...

```SASS
.z-keyword
    color: #9f35a2

.z-comment
    color: #a0a1a7
    font-style: italic

.z-assignment
    color: #9f35a2

.z-type
    color: #e06c75

.z-modifier
    color: #9f35a2

.z-name
    color: #5184f3

.z-inherited-class
    color: #e06c75

.z-declaration
    color: #e06c75

.z-parameter
    color: #e06c75

.z-constant
    color: #d19a66

.z-assignment
    color: #0184bc

.z-string
    color: #5aa659

```

Another slight annoyance was trying to work out how to style the code block element, as in to give it a background, some padding, shadow etc.

Let's play a game. If you were going to create a semantic HTML element that defines a code block what would you call it?

Wrong it's called `pre`. Bet you're kicking yourself right now.

There is a semantic element for `code`, which is for any code both inline and blockified.

This poses an issue though if you want to style inline code differently since the code in the codeblock is also wrapped in a `code` semantic element. Instead you need to act only on `code` nested in `p` to style inline blocks like this:

```SASS
p code
    background: $element-background
    font-family: 'Source Code Pro', monospace
    color: $element-foreground
    padding: $xx-small $x-small $xx-small $x-small
    border-radius: $border-radius
```

To style general code blocks is the following:

```SASS
pre
    padding: 1rem
    line-height: 1.6
    font-size: 1.25vh
    overflow: auto
    border-radius: $border-radius
    font-family: 'Source Code Pro', monospace
    background-color: #fff
    box-shadow: rgba(0, 0, 0, 0.1) 0px 5px 30px
```

## Extra Features

### Codepen

Those fancy codepen embeds you saw are provided by Codepen, they let you embed them through either an i-frame or raw HTML. I chose HTML because it gives me a little more control but copying and pasting the whole embed every time leaves the markdown looking a little messy. And remember, if you find yourself writing the same thing over and over again, don't. You've done it once already just use that.

Zola provides functionality to create custom shortcodes. These are commands that you call in the markdown that will summon the specified HTML spirit into the compiled HTML with whatever instructions you tell them. For the codepen the shortcode template is as follows:

```HTML
<div class="codepen-container">
  <p
    data-slug-hash="{{slug}}"
    data-editable="true"
    class="codepen" data-height="300" data-theme-id="dark" data-default-tab="css,result" data-user="sam-youatt" 
    style="
      height: 300px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid;
      margin: 1em 0;
      padding: 1em;
    "
  >
    <span
      >See the Pen
      <a href="https://codepen.io/sam-youatt/pen/{{slug}}"> Untitled</a>
      by Sam Youatt (<a href="https://codepen.io/sam-youatt">@sam-youatt</a>) on
      <a href="https://codepen.io">CodePen</a>.</span
    >
  </p>
  <script
    async
    src="https://cpwebassets.codepen.io/assets/embed/ei.js"
  ></script>
</div>
```

The important part is imprisoned by the double braces: `slug`. Everything else is repeated across all the pens but Codepen need some way to know which file to display, by being passed a slug like some sort of trade deal performed by children in a freshly raining garden. The double braces let Zola know that these are one of those instructions you're going to give it. Calling is then the much shorter summoning ritual: `{{*codepen(slug="XxXCornDog")*}}`.

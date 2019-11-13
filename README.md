[![TravisCI](https://travis-ci.com/pirobtumen/filler.svg?branch=master)](https://travis-ci.com/pirobtumen/filler)
[![Coverage Status](https://coveralls.io/repos/github/pirobtumen/filler/badge.svg?branch=master)](https://coveralls.io/github/pirobtumen/filler?branch=master)

# Filler

Static web sites made easy.

**Table of content**

- [Filler](#filler)
  - [Objective](#objective)
  - [Features and Roadmap](#features-and-roadmap)
  - [Examples](#examples)
- [Usage](#usage)
  - [Installation](#installation)
  - [Commands](#commands)
- [Documentation](#documentation)
  - [Folder structure](#folder-structure)
  - [Template system](#template-system)
  - [Snippet system](#snippet-system)
  - [Blog system](#blog-system)
- [Contribute](#contribute)
- [License](#license)

## Objective

Filler is a tool to create a static website using templates, reusing code and saving time. Its main purpose is to be as simple as possible to use.

## Features and Roadmap

- [x] Uses generic file types only. [v0.1.0]
- [x] Template system. [v0.1.0]
- [x] Snippet system. [v0.1.0]
- [x] Progressive builds (it only writes files that have changed, but you can `--force` it). [v0.1.0]
- [x] CSS minification. [v0.1.0]
- [x] Blog post, recent posts and archive. [v0.1.0]
- [x] Markdown support.
- [ ] Improve logging system.
- [ ] Improve error system.
- [ ] Docs and GitHub pages.
- [ ] Serve project: build in memory and watch for file changes.
- [ ] Support saving into cloud storage (AWS S3, Google Cloud Storage...).
- [ ] Example templates.
- [ ] "init" command.
- [ ] Multilingual sites.
- [ ] JS Components (React, Vanilla, Preact...?)
- [ ] SEO features.
- [ ] Any proposal? Contribute!

## Examples

- [www.pirobits.com](https://www.pirobits.com) - [Source: GitHub](https://github.com/pirobtumen/pirobits.com)

# Usage

## Installation

Install node 12.13 LTS [[Download link](https://nodejs.org/en/download/)]. You can also use nvm or any other node version manager.

Install filler:

```shell
git clone https://github.com/pirobtumen/filler.git
cd filler
npm ci
npm run build
node filler --help
```

## Commands

- build \<folder\> [OPTIONS]

  - folder: project folder path. E.g.: "~/Projects/myweb".
  - --output: output folder path. Default: ./dist
  - --force: force build all files. Default: false
  - --mode [dev, prod]: build mode. Replace specific snippets. Default: dev
  - --recentPosts [number]: number of recent posts rendered. Default: 5
  - --postsFodler [string]:  output posts folder. Default: blog.

# Documentation

## Folder structure

Create the following file structure:

```
- ~/Projects/myweb
  - /posts
    - post1.html
  - /snippets -> supports only two by now: scripts, analytics
    - scripts.html -> replaced in all modes
    - analytics.html -> replaced only in prod mode
  - /templates
    - main.html
  - /public -> files and structure can be created freely
    - index.html
    - 404.html
    - /assets
      - logo.png
    - /styles
      - styles.css
```

Build command for development:

`node filler ~/Projects/myweb`

Build command for production (injects analytics):

`node filler ~/Projects/myweb --mode prod`

The output folder will contain:

```
- /dist
  - index.html
  - 404.html
  - /post
    - post1.html
  - /assets
    - logo.png
  - /styles
    - styles.css
```

## Template system

The files inside the public folder can use any template created inside the `/templates` folder. The idea is to set the property `@template <template filename>` inside a comment in the top part of the file. Let's see an example:

```html
File: ./public/index.html
<!--
  @template main
-->

<h1>I'm the main web page!!</h1>
```

```html
File: ./templates/main.html
<div>
{{content}}
</div>
```

The `{{content}}` will be replaced by the previous file content.

```
Result: ./dist/index.html
<div>
I'm the main web page!!
</div>
```

It also supports Markdown files:

```markdown
File: ./posts/my-first-post.md
<!--
  @template post
  @author Some name
  @title First post
  @date 01-01-2019
  @description First blog test
-->

# I'm the first post!!

With a list:
- A
- B
- C
```

## Snippet system

Currently there are only two supported snippets:

- /snippets/scripts.html: replaced in every mode.
- /snippets/analytics.html: replaced only in `prod` mod.

```
File: ./templates/main.html
<head>
  {{snippet:script}}
  {{snippet:analytics}}
</head>
<div>
{{content}}
</div>
```

The `{{snippet:<name>}}` will be replaced by the previous file content.

```
Result: ./dist/index.html
<head>
  <script> const a = 'Hello world'</script>
  <script> analytics only in prod  </script>
</head>
<div>
I'm the main web page!!
</div>
```

## Blog system

The files inside the `/post` folder can use any template created inside the `/templates` folder. The idea is to set the parameter `@template post` inside a comment in the top part of the file. It will also have some extra properties: `@title`, `@description`, `@author` and `@date (dd-mm-yyyyy)`. These properties are used to build the `post` template itself, the `{{blog:recent-post}}` and `{{blog:archive}}`.

**Note: posts must have the *post* template.**

For exammple:

```
File: ./post/my-first-post.html
<!--
  @template post
  @author Some name
  @title First post
  @date 01-01-2019
  @description First blog test
-->

My firs blog post content
```

```
File: ./templates/post.html
<!--
  @template main
-->

<div class="post">
  <h1>{{title}}</h1>
  <div>
    <span class="description">{{description}}</span>
  </div>
  <span class="date">{{author}}, {{date}}</span>
  <div>
    {{content}}
  </div>
</div>
```

If you want to use `{{blog:recent-posts}}` or `{{blog:archive}}`, you need to create the `/template/recentPost.html` or `template/archivePost.html` template in order to render them. For example:

Then you can insert the markups `{{blog:recent-posts}}` or `{{blog:archive}}` where you want, for example in the main page:

```
File: ./public/index.html
<div>
I'm the main web page!!
<h1>Recent posts</h1>
{{blog:recent-posts}}
</div>
```

You can control the number of recent post displayed with the `build --recentPosts <number>` argument.

Inside the recent posts or archive templates, the post properties can be injected and will replace the template markups:

- {{title}}: Post title (@title)
- {{description}}: Post description (@description)
- {{author}}: Post author (@author)
- {{date}}: Post date (@date)
- {{href}}: Post link href

Some examples:

```
File: ./template/recentPost.html
<div class="post">
  <div>
    <span class="title">{{title}}</span>
    <span class="date">{{date}}</span>
  </div>

  <span class="description">{{description}}</span>
  <a href="{{href}}">Continue reading</a>
</div>
```

# Contribute

Feel free to:

- Submit bugs/features.
- Open a Pull Request with some fix/feature.

# License

Filler is distributed under BSD 3-Clause license. Check the LICENSE.md file.

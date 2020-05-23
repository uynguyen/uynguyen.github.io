---
title: Building your personal page with Hexo
date: 2020-04-27 20:56:51
tags: Hexo
---
![](/Post-Resources/Hexo/Cover.png "Hexo")
As I build this personal site, my first aim is to enjoy my hobby of writing. I write whatever I learn on along with my daily working, and share it. I hope my share will help someone when they need it. In return, I will have a deep of understanding what I write, and sometimes, receive "a cup of coffee" (Buy me Coffee) from a friend I've never met. ☺️
> **Power is gained by sharing knowledge, not hoarding it**

Some friends come to me asking how to build a page like mine. I'm happy to share with you how I build it. 
After this tutorial, you can build your own site within 5 minutes.
I hope to see your page launching soon!

<!-- more --> 
## Set up tools

### [NodeJs for mac](https://nodejs.org/en/download/)
Navigate to NodeJS page, download, and install NodeJs package for macOS.
For those who don't know what NodeJs is, NodeJs is an open-source, cross-platform (OS X, Window, Linux), Js runtime environment for writing service-side in Javascript.
By using the non-blocking I/O model, NodeJS is a great choice for real-time applications, chat, data streaming, etc.
With a large community, NodeJs package ecosystem is more and more various and efficiency making NodeJS become one of the best development trends in recent years. You can find more info of NodeJs on the internet if you find it interesting.
### [Hexo](https://hexo.io)
Hexo is a blog framework powered by NodeJs. Simple and fast features of Hexo make it become a dominate among other blog frameworks such as Hugo, Wordpress, Grav, etc.
I choose Hexo to build my blog because I get used to with NodeJS commands. Moreover, Hexo provides many themes that you can easily integrate to your blog with a full of customization.
After installing NodeJs successfully, open your terminal and type these following lines
```bash
npm install hexo-cli -g [1]
hexo init blog [2]
cd blog [3]
npm install [4]
hexo server [5]
```
Here is the step-by-step:
1. Install hexo command line as a global command.
2. Create your blog folder.
3. Move to the folder.
4. Install node dependencies.
5. Run your server.

Hexo will be run at `localhost:4000` by default. Now open `http://localhost:4000` in your browser to see the result.
![](/Post-Resources/Hexo/Blog.png "Blog")

## Personalize your website
At the root of your folder, there is a `_config.yml` file that contains your page configs. You can modify something like page title, page author, article format, etc. For more information, please refer to Hexo documents.

## Start writing
To create new artical, type 
```bash
hexo new "My first blog"
```
Here, you create a post named "My first blog". Reload your browser, you will see the result.
![](/Post-Resources/Hexo/New_Post.png "New Post")

Please note that Hexo uses [Markdown syntax](https://en.wikipedia.org/wiki/Markdown) for editing, so please make sure you're familiar with Markdown syntax.

## Themes
The community of Hexo provides a lot of themes that you can choose by your favorite and personalize this theme as yours. It saves your time a lot thank to the great community.
Navigate to [Hexo themes](https://hexo.io/themes/) and find the one you like, follow their instruction to download to your blog folder.
Next, modify the `_config.yml` file, search and replace the `themes` config with your new theme name.
```bash
theme: whatever
```

## Deployment
By using the command line `hexo generate`, Hexo will automatically generate all your static files which you can upload to your server and distribute it to your users. 
In case you don't own a server, no worry! There are a lot of free-host servers out there. You might have heard about [Github page](https://pages.github.com). Basically, Github page provides a free host and domain for your page, like mine "uynguyen.github.io". If you want to use Github page as your host, please follow the instructions to create your github page repository.
After having your own repository, install `npm install hexo-deployer-git` that allows you to deploy your site.
Next, edit the `_config.yml` file, from the "deploy" section > add your deployment target information
```bash
deploy:
  type: git
  repo: <repository url>
  branch: [branch]
  message: [message]
```

From now on, once you finish writing, you can publish your posts via command
```bash
hexo clean && hexo deploy
```

You can also use Heroku for deployment instead of using github. For more information, please refer to [Hexo deployment](https://hexo.io/docs/one-command-deployment.html)

## Conclusion
If you want a simple - personal page to share your ideas and contents, Hexo and Github page become such a great tool for you. With its simplicity and its community, It's easy to set up, allowing you to just focus on what matters: Your sharing.
I hope you find this post useful.


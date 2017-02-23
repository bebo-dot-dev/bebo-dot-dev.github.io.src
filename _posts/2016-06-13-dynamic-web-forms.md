---
layout: post
title: "esp8266 Dynamic Web Forms"
date: 2016-06-13 19:40:46
image: '/assets/img/ajaxWebPage.png'
description: "A proposed web page pattern.."
tags:
- esp8266
- HTML
- AJAX
- JavaScript
categories:
- web
- internet
twitter_text: "esp8266 Dynamic Web Forms"
---

## The problem
In my [last post](/id8266-aka-skynet/) where I talked about my ep8266 web based firmware project, it became apparent fairly early in the process of putting things together than I needed some way to render dynamic data in the web pages I was building e.g. current device network configuration settings, device web server settings etc. In the 'heavyweight' web based systems and platforms that I've worked with in my day job there has always been some sort of framework to help out in this area. If I was working / developing in ASP.NET web forms, MVC, PHP, Express / Jade etc., all of these technologies have their own way of enabling a developer to create and return a dynamic web page from the server. Not so with the esp8266 however - at least not that I was able to find when I was looking in Jan 2016. So how can this problem be solved?

## Potential solutions
I considered two potential solutions to this problem:

1. Develop my own server side 'framework' for this problem, emulating required functionality by borrowing (read as stealing) proven ideas from existing frameworks like MVC, Jade etc
2. Side step the issue in some way without having to do a ton of work.

Whatever I ended up going with, I kept in mind I would not lose sight of the fact that the resulting code needed to be reasonably easy to maintain going forward.

I'll openly admit that I'm no C/C++ expert so option (1) was not looking good from the start. To be honest I struggled to start to describe something that could be designed and implemented within the constraints of a tiny device footprint like the esp8266 which would eventually lend itself to maintainable web server code. This was making me lean towards something in the option (2) area. So I considered this as a general pattern (I'm not sure if there's an actual name for this as an ajax design pattern):

![AJAX enabled web page](/assets/img/ajaxWebPage.jpg  "AJAX enabled web page")

This image is basically describing the following process:

1. A user makes a request for a page (HTTP GET request)
2. The server renders the static part of the page as the response. In my project I deliver all static content from the SPIFFS 
3. As part of the static page content, JavaScript is included which is setup to auto-execute on page load done in the client browser
4. When the page loads, the JavaScript that was delivered as part of the static makes an AJAX call to the server to get the rest of the dynamic content for the page. The server receives this request and returns a JSON response
5. The JSON response is processed by JS code and the page DOM is dynamically updated with the data in the JSON object. Call this DHTML / dynamic injection or whatever you like - this is the part that updates the page with the dynamic content.

## The Ajax solution
So this was the solution that I settled on but there are a few things to say about this as a solution:

- In my project I use the fabulous [esp8266 Arduino Core](https://github.com/esp8266/arduino) and at time of writing I'm using the [ESP8266WebServer](https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266WebServer) to serve pages. This pattern by design implies the following for each and every page that is to be served:
    - Implementation of a GET handler to handle the initial static page GET request
    - Implementation of a GET handler for the AJAX request made at page render completion time
    - Implementation of a POST handler if the page contains a form which will be later submitted by the end user
    - The HTML, JavaScript and JSON for each page needs to be designed and implemented in such a way so it acts as a sort of a partnership / orchestration where it all works perfectly together.

Getting all of this aligned and working might sound like a lot of effort and to be fair when I started out it was a pattern that had to be learnt and adjusted to. I also found in the early days I had to come up with a workflow that suited this pattern to enable me to iterate efficiently with minimal pain. The decision to settle on this as a dynamic web page pattern started to pay off after about a month and it came with the following benefits:

- For the reasons bulletted above, the pattern is by definition modular which imposes a modular approach when implementing JavaScript and C/C++ handling code
- Modular JavaScript and C/C++ handling code == readable maintainable blocks of code (if done right)

Perhaps what I eventually settled on can be considered the 'poor man's way' for implementing dynamic web forms on the esp8266. I suspect that someone with better C/C++ skills than me and the appetite to implement an efficient server side templating framework would say that. If you're doing this sort of thing too, I'd appreciate it if you could outline your approach to solving this problem in the comments.
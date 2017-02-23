---
layout: post
title: "esp8266 String Optimization"
date: 2016-06-15 21:20:02
image: '/assets/img/preprocessor.jpg'
description: "Get that pre-processor working!"
tags:
- esp8266
- C/C++
- arduino
categories:
- firmware
twitter_text: "esp8266 String Optimization"
---

## Big software / little software
Traditional software systems and platforms (think Twitter, your operating system, the web browser you're using right now to read this article etc) run on servers and personal computers that have gigabytes of RAM available for developers to use. Mobile phones have reached the point where they also have gigabytes of RAM onboard. Add to this operating system features like virtual memory management and it's easy to see why developers that are creating software targetting these platforms might tend to treat system resources as limitless to use as they see fit. There are exceptions to this generalization but at the risk of sounding like a 'get off my lawn' old git, the hardware that's available in large systems today can induce a certain level of lazyness in developers  - and I include myself here too. Need a string? Declare it and use it without giving it a second thought and move on. It does go further than this too, but this article is about strings so I'll leave it there.

Developing embedded software that targets a microcontroller forces a developer to think about things differently however: Operating system - no, your microcontroller code runs directly on the metal. Exception handling? None. Virtual memory management? Doesn't exist. Lots of RAM? Forget it, you're working in an environment with kilobytes of SRAM (~40kB usable on an esp8266) and perhaps a few megabytes of flash memory for non-volatile storage if you're lucky. This means that every line of code you write to run on your microcontroller is ideally developed to be as efficient as it can be.

## When strings go bad
I think the problem might start with the many small pieces of sample code available all over the internet for esp8266 boards and arduino type boards that show strings embedded directly within C/C++ and arduino sketch code. The code samples included in the esp8266 arduino core also don't help here; if you take a look at the [arduino core code samples](https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266WebServer/examples){:target="_blank"} for the ESP8266WebServer class, you don't have to go far to see many examples of string literals embedded directly within C/C++ .ino sketch file code. I understand that these examples exist to prove a point on some specific piece of functionality but at the same time this is the open source equivalent of 'not production quality code' without any actual warning being mentioned. 

For very small projects, embedding strings directly into microcontroller code might not pose a problem at all however as a project grows over time from small to medium and onto large, I'd say that many directly embedded string literals can start to become an issue in two main ways:

1. Strings become sprawling and scattered through project code and as a result are difficult to find and maintain.
2. String literals directly embedded in code are mapped directly into heap memory on a device and eventual heap memory depletion == unexpected application crash and device reboot.

## Where did it all go wrong?
Like all other web applications that I've ever worked on, my esp8266 [web based firmware](/id8266-aka-skynet/) project code performs lots of string comparison and string manipulation operations at runtime. Consider working scenarios where http headers are scanned and examined in requests, routes to pages are defined, mime types are defined, http headers are returned, form post and query string variables are received, validated and transformed..etc the list goes on.

For me it started to go wrong pretty much from the start; I started out with the goal of building an esp8266 web based application based on the [Arduino Core](https://github.com/esp8266/arduino) and it's libraries with little working knowledge or background in arduino devices in general. From this starting position coupled with the volume of example code pieces that  demonstrated various features available coming with no health warning, it was easy to go wrong early.

It wasn't apocalyptic and I didn't see a catastrophic failure but as my project code was growing over time, I did notice that heap memory was slowly starting to deplete as I was adding more functionality. When I started out with early investigations using the esp8266 arduino core, I saw that free available heap was approximately 34kB. Around April 2016, 4 months into project development, my heap memory had depleted down to approx 19kB at runtime. Something was wrong and it was time to investigate. 

After a short while reading around, I learnt how bad it can be to embed many strings directly in microcontroller code as these strings are mapped directly into heap RAM. If the same exact string is declared multiple times, every copy of that string uses another small chunk of heap memory. I was happy I'd found a candidate problem to go after to improve the situation with heap memory usage.

## A solution to the problem
Now that I'd found a problem related to strings, I wanted to fix it in a way that addressed what I thought were the two main issues - poor maintainability of many strings and also of course the heap memory problem itself. The solution I came up with leverages the compiler pre-processor and it goes as follows:

1. A string table is #defined to described all application strings and a corresponding unique enum value for each string defined. This satisfies the need to be able to maintain all strings in a single location
2. An array of strings leveraging [PROGMEM](https://www.arduino.cc/en/Reference/PROGMEM){:target="_blank"} is #defined to ensure that all strings are stored in flash memory at compiled binary image -> device image upload time. This solves the heap memory depletion problem.
3. A little helper function is introduced to make it easy to retrieve a string from flash using the corresponding unique enum value for a specific string.

With this pattern in place, all that was left to do was to embark on a sizeable code refactoring exercise to swap all of my inline embedded string literals for calls to the new string helper function. About a week later and after a bunch of testing and bug squashing it was done and the nett result: about 6kB of heap memory was recovered and runtime heap usage was back somewhere around 26kB. Was it worth the effort? I'd say so yes. 

Of course this isn't to be considered a silver bullet for all inline embedded strings in microcontroller code everywhere - in fact in areas of code where performance is an important factor, you'd want to make sure your strings are inline embedded so they are mapped directly into SRAM for speed; mapping strings from PROGMEM flash memory is a slow operation compared to direct RAM access. This is however a solution to inline string abuse and can be used where appropriate.

Sample code that demonstrates this pattern is uploaded here along with a few further details included in the README.md: [https://github.com/jjssoftware/applicationStrings](https://github.com/jjssoftware/applicationStrings)
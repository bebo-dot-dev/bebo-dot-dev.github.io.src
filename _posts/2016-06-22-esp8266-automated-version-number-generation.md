---
layout: post
title: "esp8266 Automated Project Versioning"
date: 2016-06-22 20:45:10
image: '/assets/img/version_control.jpg' 
description: "need a version number? do it the automated way"
tags:
- esp8266
- C/C++
- arduino
categories:
- firmware
twitter_text: "esp8266 Automated Project Versioning"
---

## Auto-generate a version number
This is a quick post about a method that can be used to get the preprocessor to do the job of generating a self incrementing version build number. This can eliminate a potentially boring repetitive task if you're currently doing it in some manual way. The trick described here uses the built in  **\__DATE__**  and **\__TIME__** GCC preprocessor macros.

Inquisitive types can read more about these macros [here](https://gcc.gnu.org/onlinedocs/cpp/Standard-Predefined-Macros.html){:target="_blank"}.

Here's the sample code for the method described: [https://github.com/jjssoftware/autoVersioning](https://github.com/jjssoftware/autoVersioning){:target="_blank"}. There's not a lot of code and it's probably quickest to just have a quick read and dive straight in. 

This method will work on both esp8266 arduino core and regular arduino projects. Enjoy! 


---
layout: post
title: "More esp8266 security"
date: 2016-11-11 07:55:43
image: '/assets/img/password.jpg' 
description: "shields up, be strong!"
tags:
- esp8266
- C/C++
- JavaScript
- security
- passwords
categories:
- security
twitter_text: "More esp8266 security"
---

## ..erm..P@55w0rd1!
IOT device security is a hot topic at the moment. Many well known websites, services and companies are regularly coming under massive DDOS attacks and are being knocked offline. Recently these attacks are coming from [Mirai malware](https://en.wikipedia.org/wiki/Mirai_(malware)){:target="_blank"} which targets IOT devices with weak default passwords and these IOT devices are being recruited into IOT powered botnets under the control of internet miscreants. Krebs came under attack, dyn came under attack and there was even discussion whether the [country of Liberia](https://krebsonsecurity.com/2016/11/did-the-mirai-botnet-really-take-liberia-offline/){:target="_blank"} was being completely knocked offline by Mirai. 

IOT device manufacturers are in the frame as being responsible because of their woeful approach to security (or lack of). It could be argued that IOT device end users are also partly responsible for leaving devices in an insecure state. However to my mind the buck stops with the IOT manufacturers because at the end of the day most users wouldn't know how to secure a device that was very likely sold as plug-and-play.

## What to do?
As a one man band IOT firmware and ESP8266/arduino hacker there's not a lot you can do all on your own to save the world from Mirai; but surely there are some lessons to be learnt from this debacle? Here's my list:

1. Don't make any devices publicly accessible over the internet unless data is encrypted. Just don't do it. If you're serving http / websocket traffic you can take a look at my [previous article](/secure-your-esp8266/){:target="_blank"} that describes how to encrypt using nginx as a reverse proxy.
2. Never make any devices with weak passwords public accessible over the internet. If you develop firmware, make your firmware force end users to use a **strong** password.
3. Consider implementing some sort of password expiration feature to force users to update their passwords regularly.
4. Read [OWASP](https://www.owasp.org){:target="_blank"}. Lots of really useful security information and tips over there.

As a developer of my own [web based firmware](https://www.youtube.com/channel/UCa_exk34O_W2tTnGeHXw5Og){:target="_blank"}, I fall into all of the above categories so I have to do my bit to protect my corner of the IOT world. The recent public DDOS attacks have led me to think again about the security features in my own ESP firmware.

## Use an SSL cert
To cover (1) above I use Let's Encrypt SSL certificates. I've discussed this in more detail [previously](/secure-your-esp8266/){:target="_blank"} but I must say again that these certs are free, are widely accepted by all modern operating systems and browsers and are IMO fabulous. This costs nothing to do so there's really no reason to not do it. Here are a couple of screenshots of one configured for one of my ESP device running in the browser:

{% lightbox /assets/img/ssl-on-device.png --data="image_set" --title="a Let's Encrypt cert configured through nginx" %}

{% lightbox /assets/img/lets-encrypt-ssl-cert.png --data="image_set" --title="fully recognized and accepted in chromium on linux mint" %}

## Session Management
I have a session management system built into my web firmware which follows a traditional pattern of login -> generate session token -> return sessionId cookie -> use sessionId cookie in susequent requests to determine session validity. As with all session cookie based auth systems, an attacker can attempt to perform a session hijack if that attacker is positioned correctly. SSL largely mitigates against the session hijack scenario. 

An important characteristic of session systems is to ensure generated sessionId values are large enough and random enough to ensure that sessionIds can't be guessed. My session management system uses [ESP8266TrueRandom](https://github.com/marvinroger/ESP8266TrueRandom){:target="_blank"} which in turn uses the ESP built in random number generator register (my PR ;)) to generate large sessionIds with a high degree of randomness.

Another important feature of session systems is to implement a method of automatic session expiry so that sessions are only valid for a specific absolute time window or sliding time window. This type of mechanism exists to prevent abuse of session if sessionIds were to somehow leak.

## Password security
I've recently reworked the password policy code in my firmware and it now works as follows:

1. The 'factory default' password is set on all virgin ESPs when the firmware is first uploaded.
2. Upon boot the firmware boots in AP mode for a virgin new install and an end user navigates to the ESP8266 web application on the default device AP IP address.
3. The user logs in using the 'factory default' password. The firmware detects the default password is in use and the user is automatically redirected to the change password page. The user has no access to any other firmware features until the default password has been changed.
4. Once a new **strong** password has been set, the user can logon again with the new password and he/she will then have full access to all firmware features.

I've emphasised **strong** a couple of times here but just how do you enforce a strong password policy? After reading around for a while and looking at various web applications, I decided that the use of a password strength meter was the way to go and I decided to use [complexify](https://github.com/danpalmer/jquery.complexify.js){:target="_blank"} in my password change page:

{% lightbox /assets/img/complexify.js.png --data="image_set" --title="complexify in the browser" %}

## jquery.complexify.js and ESP8266Complexify
jquery.complexify.js is nice because it supports a banned password list generated from 500 worst passwords and 401 banned twitter passwords as of 20/05/2015. This removes the ability for a user to use one of a bunch of known really poor passwords. I'm sure if a user was really determined, they could still attempt to game complexify in some way to get a semi-poor password past it but that behaviour would be in the realm of the user and complexify does it's best to prevent this. 

Of course complexify in the browser is only half the story, a good web application will never trust what gets sent up from the client side and validation also needs to be performed on the server side. To enable this I implemented an arduino core c++ complexify port for use in my firmware. That code is here: [https://github.com/jjssoftware/ESP8266Complexify](https://github.com/jjssoftware/ESP8266Complexify){:target="_blank"}

Now my change password HTTP POST handler verifies that the new supplied password and confirm password both match and it also verifies that the given password actually is complex enough via a `Complexify::IsPasswordValid` call.

## Future features
That's it for my implementation for the moment but there's always room for improvement and possible future features might include:

1. Brute force protection
2. Auto password expiration policy
3. Forgotten password / password reminder
4. 2 factor authorisation e.g. google authenticator
5. Password rotation prevention

As mentioned previously there's not much one person can do to turn the tide against an army of rogue IOT cameras and DVR players but the least I can do is try to keep my own stuff safe.

Who knows, perhaps one day when we're all shifting a million+ ESP8266 widgets to the masses we can hope that we're still aiming to do the right thing and with a bit of luck it won't be us in the frame when a new IOT army rises to kill the internet ;)

If you have any security tips of your own, please drop a comment below thanks
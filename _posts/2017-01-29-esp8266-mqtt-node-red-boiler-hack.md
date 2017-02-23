---
layout: post
title: "esp8266, MQTT and node-RED"
date: 2017-01-29 12:09:55
image: '/assets/img/node-RED.flow.png' 
description: "a DIY web enabled home heating system"
tags:
- esp8266
- MQTT
- node-RED
- boiler
- Worcester-Bosch
- digistat
- DT10RF Mk2
categories:
- applications
twitter_text: "a DIY web enabled home heating system"
---

## Another Worcester-Bosch boiler hack
I decided to automate my heating system after being inspired by [Steven Hale's phenomenal original work](http://www.stevenhale.co.uk/main/2013/08/home-automation-reverse-engineering-a-worcester-bosch-dt10rf-wireless-thermostat/){:target="_blank"}

This post is a whistle-stop tour in pictures and video of my take on Steve's method of reverse engineering the 433MHz signals sent from my [DT10RF MK2](https://www.worcester-bosch.co.uk/professional/support/documents/worcester-dt10rf-installation-instructions){:target="_blank"} thermostat, to enable a node-RED system to be built around my home heating system for more flexible monitoring and control. Many thanks go to Steve for paving the way to make this build a reality.

**SDR dongle [(ebay listing here)](http://www.ebay.co.uk/itm/252674906658){:target="_blank"}:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/sdr-dongle.jpg --data="image_set" --img-style="max-width:40%;" --title="The SDR dongle I used to capture the 433MHz signals for boiler ON/OFF being sent from my DT10RF Mk2 thermostat" %}

**Captured raw 433MHz signal in audacity:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/boiler-raw.png --data="image_set" --img-style="max-width:40%;" --title="A single pulse stream section of 433MHz radio data for a boiler switch ON signal captured as it was sent over the air by my DT10RF Mk2 thermostat (zoomed)" %}

**Prototyping and testing 433MHz transmission with an arduino uno:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/arduino-433-testing.png --data="image_set" --img-style="max-width:40%;" --title="Prototyping / testing code and signal timing with a spare arduino uno I had lying around before moving onto the ESP8266 implementation" %}

**ESP8266 firmware support for complex peripherals:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/myWidget.peripherals.png --data="image_set" --img-style="max-width:40%;" --title="Configuration of the Digistat MK2 and DHT22 peripherals in my ESP8266 widget firmware" %}

**ESP8266 firmware support for MQTT:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/myWidget.MQTT.png --data="image_set" --img-style="max-width:40%;" --title="My ESP8266 widget configured to publish and subscribe MQTT topic data to an MQTT broker on the LAN" %}

**Built widget on stripboard in enclosure:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/widget-on-stripboard.jpg --data="image_set" --img-style="max-width:40%;" --title="An ESP12F mounted on a white breakout, DHT22 and 433MHz transmitter with a home made 5v->3.3v regulated supply all mounted on stripboard" %}

**Enclosed widget:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/widget-enclosed.jpg --data="image_set" --img-style="max-width:40%;" --title="Widget boxed up ready to be plugged in" %}

**node-RED MQTT connected flow:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/node-RED.flow.png --data="image_set" --img-style="max-width:40%;" --title="The main node-RED flow responsible for controlling heat switching" %}

**node-RED dashboard page 1:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/node-RED.dashboard1.png --data="image_set" --img-style="max-width:40%;" --title="node-RED dashboard page #1 that enables set-point and direct heating system control " %}

**node-RED dashboard page 2:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/node-RED.dashboard2.png --data="image_set" --img-style="max-width:40%;" --title="node-RED dashboard page #2, on/off monitoring graph" %}

**node-RED dashboard page 3:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/node-RED.dashboard3.png --data="image_set" --img-style="max-width:40%;" --title="node-RED dashboard page #3, current temperature gauge and mini temperature history graph" %}

**node-RED dashboard page 4:**{: style="display:block; text-align: center;"}
{% lightbox /assets/img/node-RED.dashboard4.png --data="image_set" --img-style="max-width:40%;" --title="node-RED dashboard page #4, current humidity gauge and mini humidity history graph" %}

**The video:**{: style="display:block; text-align: center;"}
**[https://www.youtube.com/watch?v=4bOZWf7TJcA](https://www.youtube.com/watch?v=4bOZWf7TJcA){:target="_blank"}**{: style="display:block; text-align: center;"}
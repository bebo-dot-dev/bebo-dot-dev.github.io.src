---
layout: post
title: "an SBC board IPSEC router"
date: 2017-06-14 08:22:55
image: '/assets/img/vpn.jpg' 
description: "create your own tiny VPN gateway device"
tags:
- VPN
- security
- internet
- web
categories:
- applications
twitter_text: "create your own tiny VPN gateway device"
---

## Who needs a VPN?
It's a giveaway from the title of this article that this is about a little VPN gateway / router device sat on the LAN so the answer is me, I need a VPN. 

But to be serious for a moment the question as to whether anyone needs a VPN is a question worth asking. There's much controversy and snake oil myth around the selling of commercial VPN services and a large proportion of this type of service selling is targetted at users who are keen on concealing questionable torrenting and streaming behaviour. 

One area where the requirement for a VPN is clear is to secure traffic between two private locations where those locations are connected by public unsecured network. This classic use case is a B2B scenario where sensitive business data is to be shared between two (or more) business office locations. Using a VPN in this scenario enables true end to end encryption between the business locations over an unsecured network and it solves a real problem. 

A personal VPN is a more tricky requirement to define. If we're talking about a VPN server hosted at a home location which is used to secure communications onto the LAN, then we're discussing a similar use case to the B2B scenario previously described. However in many cases a personal VPN is not of this type and is arranged the other way around where the VPN server is located in some remote location. This arrangement serves to tunnel traffic off the LAN to a remote VPN server location and onto the internet and users interested in this type of setup are commercial VPN provider target customers. 

Does this mean that users who fall into this category do not have a valid need? The answer to this question is increasingly no because one valid use case for a personal VPN is the hostile network argument. This is increasingly becoming an issue certainly in the US where ISPs were recently handed the power to [do whatever they feel like doing with their customers' metadata](https://www.recode.net/2017/3/29/15109650/isp-customer-data-browsing-history-proxy-server-vpn-senate){:target="_blank"}. Legislation is steadily moving to allow ISPs to be hostile to their own customers.

So perhaps you're in the position of having no choice but to use an ISP that has this power. You might be in doubt as to whether your usage metadata is being sold or monitored. Or perhaps you're being 'traffic shaped' / throttled due to what your ISP believes you're doing. All of these strengthen the case for using a personal VPN.

Another valid use for a personal VPN is in those situations where you must use public WiFi i.e. airport departure lounge. Yet another is mobile carrier networks.

## Who do you trust?
If you've got this far and you're thinking you have a need to use an off-the-LAN VPN server, who you do trust? An important thing to note with a personal VPN server hosted on the internet is that your traffic is secure only in the tunnel between you and the VPN server and no further. As soon as traffic leaves the VPN tunnel onto a regular network and then possibly out onto the internet, anyone can see what you're doing.

With this in mind, can any public commercial VPN service be trusted? Some proudly sell their services on the strength of not maintaining any logs of their customers' network use, but the fact is it's impossible to know what if anything might be logged, because the VPN server is hosted on someone elses computer in someone elses datacentre, managed by someone you don't know at all. 

In fact to take this one scary step further, using a service like this is to knowingly allow the VPN provider to MITM your data. Couple a MITM vector with an unscrupulous actor and a DNS exploit and all of your TLS secured traffic can be turned into clear text traffic with a [MITM attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack){:target="_blank"} and it's game over.

If you were to take the view that this isn't good enough, what about running your own VPS with a VPS service provider and running your own self hosted, self managed VPN server on that instance? This sounds marginally better but to be honest it's no better than the commercial VPN service provider because you simply don't know what type of network logs if any, the VPS service provider may be maintaining. In fact so far as network logs go, the same applies to AWS, Azure, Google Compute, Digital Ocean and all the others; they're all someone elses computers in someone elses datacentre. 

To be honest this all sounds a bit a grim and depressing and the fact is that none of us mortals own a datacentre + all the tin and network infrastructure involved. So if we want to use a personal VPN server hosted somewhere that's not within the safe zone of our private LAN, we have to choose one of the above options even if none of them are perfect. 

My personal slant is towards implementing / using a self hosted, self managed VPN server.

## Setting up the server side
[Algo VPN](https://github.com/trailofbits/algo){:target="_blank"} is my choice purely for ease of setup. They do a far better job of explaining why this is a good choice in their [github readme](https://github.com/trailofbits/algo/blob/master/README.md){:target="_blank"} and [also in their blog](https://blog.trailofbits.com/2016/12/12/meet-algo-the-vpn-that-works/){:target="_blank"} so I won't repeat it all again here but I will say that one of the big features for me is Algo's support for multiple common cloud providers. This makes it really easy to setup a VPN server, tear it down and setup again elsewhere. If you go this route you can have a VPN server setup in the time it takes you to:

1. sign up with one of the supported cloud providers e.g. an AWS free tier account
2. download Algo and install the build dependencies
3. make a simple change to the Algo `config.cfg` file to configure your VPN users
4. execute the `./algo` script

For a first run, having an Algo VPN server setup and working in under an hour is easily achievable.

## Setting up the client initiator side
Algo is based on [StrongSwan](https://wiki.strongswan.org/projects/strongswan){:target="_blank"} and Algo only supports IKEv2. This is a relatively new key exchange mechanism but is considered by network experts to be more secure than IKEv1 and other VPN protocols including OpenVPN. The good news is that Algo takes most of the pain out of setting up the client side because as part of the install, a CA cert, user certificates and sample configuration files are created ready for use. For a linux client initiator, the process in short is:

1. Install StrongSwan. I recommend downloading the latest and building from source because distro repository versions tend to be old and out of date. At the time of writing StrongSwan VPN is at v5.5.3. You can <a href="/assets/scripts/download-build-strongswan.sh" download>download and use this script</a> to automate StrongSwan download and build. Check the latest version and review the `./configure` options within the script before running as root. 
2. Copy `/your-algo-path/configs/cacert.pem` to `/etc/ipsec.d/cacerts`
3. Copy `/your-algo-path/configs/pki/certs/your-user.crt` to `/etc/ipsec.d/certs`
4. Copy `/your-algo-path/configs/pki/private/your-user.key` to `/etc/ipsec.d/private`
5. Edit `etc/ipsec.secrets` including the user key into the file e.g. `<server_ip> : ECDSA your-user.key`
6. Copy `/your-algo-path/configs/ipsec_your-user.conf`to `/etc/ipsec.conf. Review the name of the first conn VPN connection in this file (`<conn-name>`).
7. `sudo ipsec restart`to pickup the configuration changes
8. `sudo ipsec up <conn-name>` to bring up the tunnel

Another thing you might want to do is create a start script for your system so the tunnel comes up when the system starts. [This is a good start point for that script](https://github.com/strongswan/strongswan/blob/master/packages/strongswan/debian/strongswan-starter.ipsec.init){:target="_blank"}

## FriendlyArm Neo2 VPN gateway
If all that works then great, you've proven the remote VPN server is working correctly and the initiator is able to establish an IKEv2 IPSEC tunnel to the server. It's also worth pointing out at this stage that there's a [StrongSwan VPN client](https://play.google.com/store/apps/details?id=org.strongswan.android&hl=en){:target="_blank"} app in the Android Play Store and it works fine; you just need to get your user certificate onto your Android device and get the VPN connection configured in the app.

It was at this point I thought it would be a nice idea if I had a VPN gateway device sat on the network that all LAN clients could tunnel their traffic through as required. At first I considered running StrongSwan on DD-WRT on a old Netgear WNR3500L router I have but after asking around in the DD-WRT forum if anyone knew anything about getting this going and receiving nothing back I decided against it. Without a clue whether it would work or not I placed an order for:

1. A FriendlyArm Neo2 SBC, heatsink and 3d printed enclosure: [http://www.friendlyarm.com/index.php?route=product/product&path=69&product_id=180](http://www.friendlyarm.com/index.php?route=product/product&path=69&product_id=180){:target="_blank"}. Total cost: $28.93 USD including delivery to the UK
2. A decent 5v 2Amp power supply: [http://www.ebay.co.uk/itm/AC-to-DC-5V-2A-Micro-USB-5pin-Power-Supply-Adapter-for-Android-Table-PC-/152524159800?](http://www.ebay.co.uk/itm/AC-to-DC-5V-2A-Micro-USB-5pin-Power-Supply-Adapter-for-Android-Table-PC-/152524159800?){:target="_blank"}
3. A genuine class10 microSD card: [https://www.amazon.co.uk/gp/product/B012VKUSIA/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1](https://www.amazon.co.uk/gp/product/B012VKUSIA/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1){:target="_blank"}

{% lightbox /assets/img/IMG_20170531_194323.jpg --data="image_set" --img-style="max-width:40%;" --title="tiny Neo2" %}

{% lightbox /assets/img/IMG_20170531_193854.jpg --data="image_set" --img-style="max-width:40%;" --title="heatsink fitted" %}

When the board arrived, I prepared the SD card with the latest Armbian build for the Neo2, booted the device, downloaded and built StrongSwan on the device. I gave the Neo2 a static IP and pointed it's default gateway at the LAN default gateway edge router. 

A couple of other things that need to be done to get routing working are to enable IP forwarding in `/etc/sysctl.conf` with `net.ipv4.ip_forward=1` and a couple of NAT rules need to be added to iptables on the device which I added via a [custom StrongSwan updown script](https://wiki.strongswan.org/projects/strongswan/wiki/Updown){:target="_blank"}:

```
iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -o eth0 -m policy --dir out --pol ipsec -j ACCEPT
iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -o eth0 -j SNAT --to-source $PLUTO_MY_SOURCEIP
```
<br/>
You might also need to tweak MSS for your LAN clients (I did):

```
iptables -A FORWARD -p tcp -m tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1380
```
<br/>
..and also tweak MSS in the dynamic StrongSwan routing table by editing `/etc/strongswan.d/charon/kernel-netlink.conf`and enabling the `mss` value.

Finally of course you need to point your LAN client devices' default gateways to point to the IP address of the Neo2 so they route their traffic through the tunnel.


At the time of writing there is an [unfortunate bug in IPSEC](https://patchwork.kernel.org/patch/9704017/){:target="_blank"} in the ipv4 network stack in linux kernel v4.11 which has been fixed by the core kernel maintainers but the patch has not made it into mainline. This means I did have to ad-hoc patch and rebuild a custom Armbian image to get ipsec working on the Neo2 but hopefully this fix will be more widely available soon.

## Wrapping up
So there you have it, a shared VPN gateway device sat on the LAN for all LAN clients to use for about £30 all in and I suppose this type of cheap device could even be used at both ends in a B2B co-location setup.

I tested throughput on the device with `speedtest-cli` ([https://github.com/sivel/speedtest-cli](https://github.com/sivel/speedtest-cli){:target="_blank"}) and it turns out that performance was actually pretty good;  there is some IPSEC processing overhead seen but the little Neo2 manages to process traffic almost as fast as my internet connection can go, so I call that success :)
---
layout: post
title: "Securing your esp8266"
date: 2016-06-18 12:19:30
image: '/assets/img/tls.png'
description: "it's a scary internet out there"
tags:
- esp8266
- arduino
- tls
- ssl
- internet
- web
- security
categories:
- web
- internet
- security
twitter_text: "Securing your esp8266"
---

## The internet and esp8266

This is an article about using TLS/SSL to secure an esp8266 device so it can be safely accessed over the internet. This is important for me because the firmware running on my device is [http web based firmware](/id8266-aka-skynet/) and I'd like to be able to access my device from anywhere. If you use your esp8266 device to switch your lights on/off, open/close the curtains, control the heating in your home, something else you don't want some random person in Timbuktoo having control of then you 100% will want to be securing access to your device(s) if you're thinking about opening up access over the internet.

At the time of writing there is no native on board support for TLS/SSL certificates and given the hardware capabilities of current boards, I'd say this is just how it is and it's unlikely to change. This means that if we want TLS protection for our esp device(s) we need to use some other external device as an up front security layer. In real terms this means the implementation of a TLS/SSL reverse proxy where the proxy device sits on the network and it has the ability to encrypt traffic and also act as a traffic relay for devices sat behind it that cannot do the job of TLS/SSL themselves. 

Note that although this post is about securing esp8266 devices, the techniques discussed can be equally applied to arduino devices with WiFi shields or indeed any computer or other device that needs securing via a TLS/SSL reverse proxy.

![Reverse proxy](/assets/img/reverse-proxy.png  "Reverse proxy")

## Enter nginx

Without further ado I'll introduce nginx as the server software that I use to act as a reverse proxy server. Nginx is a lightweight highly configurable web server that does a great job as a TLS/SSL reverse proxy server. In this article I'll demonstrate a working nginx configuration file to enable TLS/SSL protection and in addition the proxy will also act as a HTTP caching server which means it can potentially hugely improve the performance of serving HTTP responses. In the case of an esp8266 device behind the SSL reverse caching proxy, this means static content can be served by nginx rather than by the esp8266 device itself. 

Obviously to use nginx, you'll need nginx installed somewhere or you need to install nginx. Personally I run nginx on my NAS device because that's a device I have on the LAN that's always on. My NAS device also runs a flavour of linux so nginx is well supported on this platform. I did need to use entware to get nginx cleanly installed because my NAS device doesn't run a mainstream linux distro with a regular package management system. 

So step 1 is to decide where you're going to run nginx, be it a NAS device, a raspberry PI you've got lying around or a spare computer. If you do need to get nginx installed, the best place to start is probably here: [https://www.nginx.com/resources/admin-guide/installing-nginx-plus/](https://www.nginx.com/resources/admin-guide/installing-nginx-plus/)

***

## The nginx configuration

Here's a working nginx configuration file which has been tested and proven to work on nginx v1.10.0. It's also actually very close to the vanilla configuration I use myself:

```
// ESP8266 nginx SSL reverse proxy configuration file (tested and working on nginx v1.10.0)

// proxy cache location
proxy_cache_path /opt/etc/nginx/cache levels=1:2 keys_zone=ESP8266_cache:10m max_size=10g inactive=5m use_temp_path=off;

// webserver proxy
server {

    // general server parameters
    listen                      50080;
    server_name                 myDomain.net;
    access_log                  /opt/var/log/nginx/myDomain.net.access.log;       

    // SSL configuration
    ssl                         on;
    ssl_certificate             /usr/builtin/etc/certificate/lets-encrypt/myDomain.net/fullchain.pem;
    ssl_certificate_key         /usr/builtin/etc/certificate/lets-encrypt/myDomain.net/privkey.pem;
    ssl_session_cache           builtin:1000  shared:SSL:10m;
    ssl_protocols               TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers                 HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
    ssl_prefer_server_ciphers   on;
    
    location / {

      // proxy caching configuration
      proxy_cache             ESP8266_cache;
      proxy_cache_revalidate  on;
      proxy_cache_min_uses    1;
      proxy_cache_use_stale   off;
      proxy_cache_lock        on;
      // proxy_cache_bypass      $http_cache_control;      
      // include the sessionId cookie value as part of the cache key - keeps the cache per user
      // proxy_cache_key         $proxy_host$request_uri$cookie_sessionId;

      // header pass through configuration
      proxy_set_header        Host $host;      
      proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header        X-Forwarded-Proto $scheme;      

      // ESP8266 custom headers which identify to the device that it's running through an SSL proxy     
      proxy_set_header        X-SSL On;
      proxy_set_header        X-SSL-WebserverPort 50080;
      proxy_set_header        X-SSL-WebsocketPort 50081;

      // extra debug headers      
      add_header              X-Proxy-Cache $upstream_cache_status;
      add_header              X-Forwarded-For $proxy_add_x_forwarded_for;

      // actual proxying configuration
      proxy_ssl_session_reuse on;
      // target the IP address of the device with proxy_pass
      proxy_pass              http://192.168.0.20;
      proxy_read_timeout      90;
    }
 }

// websocket proxy
server {

    // general server parameters
    listen                      50081;
    server_name                 myDomain.net;
    access_log                  /opt/var/log/nginx/myDomain.net.wss.access.log;

    // SSL configuration
    ssl                         on;
    ssl_certificate             /usr/builtin/etc/certificate/lets-encrypt/myDomain.net/fullchain.pem;
    ssl_certificate_key         /usr/builtin/etc/certificate/lets-encrypt/myDomain.net/privkey.pem;
    ssl_session_cache           builtin:1000  shared:SSL:10m;
    ssl_protocols               TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers                 HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
    ssl_prefer_server_ciphers   on;
    
    location / {     

      // websocket upgrade tunnel configuration
      proxy_pass                    http://192.168.0.20:81;
      proxy_http_version            1.1;
      proxy_set_header Upgrade      $http_upgrade;
      proxy_set_header Connection   "Upgrade";
      proxy_read_timeout            86400;
    }
 }
```

***

## The config explained

I won't go into an exhaustive discussion about everthing in this configuration but I will point out some of the interesting parts with reference to the official docs:

1. Note that you can have multiple configuration files on nginx. Each file with a **server** section represents a separate hosted web service. Just make sure you separate correctly and get your ports right.
2. The **proxy_cache_path** directive describes the caching configuration for this server. Read more about this [here](http://nginx.org/en/docs/http/ngx_http_proxy_module.html?&_ga=1.185147755.316971408.1464531053#proxy_cache_path)
3. The **listen** directive tells the server what port to listen on. Read more about this [here](http://nginx.org/en/docs/http/ngx_http_core_module.html?&_ga=1.42541799.316971408.1464531053#listen)
4. The **server_name** should match the domain name of the domain that this **server** is intended to service. Read more about this [here](http://nginx.org/en/docs/http/ngx_http_core_module.html?&_ga=1.42541799.316971408.1464531053#server_name)
5. The **ssl** directives are used to configure nginx to make it aware of the TLS/SSL cert in use and it's configuration. The certificate shown in use in the configuration above is a LetsEncrypt certificate. You can read more about LetsEncrypt [here](https://letsencrypt.org/about/) and you can read about the nginx **ssl** directives [here](http://nginx.org/en/docs/http/configuring_https_servers.html)
6. The **location /** section within the **server** section bascially means "use the following configuration within this location section for all requests made to this server"
7. The **proxy_set_header** directive is used to pass HTTP request headers through to the device(s) behind the proxy. The device or server behind the proxy will receive these headers and can use them for whatever purpose necessary. Read more about this [here](http://nginx.org/en/docs/http/ngx_http_proxy_module.html?&_ga=1.108154304.316971408.1464531053#proxy_set_header)
8. The **proxy_pass** directive identifies the backend device and port for the device being proxied. This means that traffic coming in for the **server_name** on the **listen** port will be proxied to the **proxy_pass** backend device / server. Read more about this [here](http://nginx.org/en/docs/http/ngx_http_proxy_module.html?&_ga=1.108154304.316971408.1464531053#proxy_pass)

## To conclude

- If you're thinking about opening up access to your esp8266 device(s), encrypting traffic is **highly recommended**
- nginx does a great job of acting as a TLS/SSL reverse caching proxy for backend private devices
- You can create your own widely accepted certificates with LetsEncrypt for the princely sum of no money!
- The above configuration works for proxying regular HTTP/HTTPS traffic and also WS/WSS websocket traffic
- The above nginx example configuration file is included as a [sample](https://github.com/Links2004/arduinoWebSockets/tree/master/examples/Nginx) in the [links2004 arduinoWebsockets library](https://github.com/Links2004/arduinoWebSockets) (my pull request :))
- Let me know what you think in the comments
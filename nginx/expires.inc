# cache.appcache, your document html and data
location ~* \.(?:manifest|appcache|html?|xml|json)$ {
  expires 30m;
  add_header Cache-Control "public, stale-while-revalidate=3600, stale-if-error=7200";
}

# Feed
location ~* \.(?:rss|atom)$ {
  expires 1h;
  add_header Cache-Control "public, stale-while-revalidate=3600, stale-if-error=7200";
}

# Media: images, icons, video, audio, HTC
location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc)$ {
  expires max;
  access_log off;
  add_header Cache-Control "public, stale-while-revalidate=3600, stale-if-error=7200";
}

# CSS and Javascript
location ~* \.(?:css|js)$ {
  expires max;
  access_log off;
  add_header Cache-Control "public, stale-while-revalidate=3600, stale-if-error=7200";
}

error_page 404 /404.html;

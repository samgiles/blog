FROM alpine as builder

WORKDIR /app/src

RUN apk update && apk add curl

RUN curl -L https://github.com/gohugoio/hugo/releases/download/v0.69.0/hugo_0.69.0_Linux-64bit.tar.gz -o hugo.tar.gz && \
    tar xf hugo.tar.gz && \
    chmod +x hugo && \
    mv hugo /usr/bin && \
    rm -rf ./*

COPY . .

RUN hugo --minify

FROM nginx:1.17-alpine

WORKDIR /usr/share/nginx/html

COPY nginx/expires.inc /etc/nginx/conf.d/expires.inc
RUN chmod 0644 /etc/nginx/conf.d/expires.inc

RUN sed -i '9i\        include /etc/nginx/conf.d/expires.inc;\n' /etc/nginx/conf.d/default.conf

COPY --from=builder /app/src/public /usr/share/nginx/html

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY scripts/generate-cert.sh /docker-entrypoint.d/00-generate-cert.sh
RUN chmod +x /docker-entrypoint.d/00-generate-cert.sh

COPY conf/ratelimit.conf /etc/nginx/conf.d/ratelimit.conf
COPY conf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 443 80

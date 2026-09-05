FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_URL_V1
ENV VITE_API_URL_V1=${VITE_API_URL_V1}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx vite build

FROM nginx:1.27-alpine AS production

RUN addgroup -S app && adduser -S app -G app && \
    chown -R app:app /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown app:app /var/run/nginx.pid

COPY --from=build /app/dist /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

USER app
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

# ---- build stage ----
FROM golang:1.26.4-alpine AS builder

WORKDIR /build

COPY go.mod go.sum ./
COPY vendor/ vendor/
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build \
    -mod=vendor \
    -ldflags="-s -w" \
    -o /build/app .

# ---- runtime stage ----
FROM alpine:3.20

RUN apk add --no-cache ca-certificates && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=builder /build/app .

USER app
EXPOSE 8000

ENTRYPOINT ["./app"]

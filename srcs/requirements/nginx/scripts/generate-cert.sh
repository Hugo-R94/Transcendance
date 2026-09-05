#!/bin/sh
set -e

CERT_DIR=/etc/nginx/ssl
CERT_FILE="$CERT_DIR/selfsigned.crt"
KEY_FILE="$CERT_DIR/selfsigned.key"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "Generating self-signed TLS certificate..."
    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=FR/ST=IDF/L=Paris/O=Transcendence/CN=${DOMAIN_NAME:-localhost}"
else
    echo "TLS certificate already present, skipping generation."
fi

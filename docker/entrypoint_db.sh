set -e

chown postgres:postgres /certificates/server.key

docker-entrypoint.sh postgres

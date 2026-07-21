.phony: all clean re gen_cert up down check db_wipe

CERT = ./certificates

all: up
	cd backend && go build && ./backend &
	cd frontend && npm run dev
	
up: ${CERT}
	podman-compose -f compose.yml up -d

down:
	podman-compose -f compose.yml down

clean:
	rm -rf certificates

fclean:clean
	rm -f Transcendance

re: down fclean all

${CERT}:
	mkdir -p certificates
	openssl genrsa -out certificates/rootCA.key 2048
	openssl req -x509 -new -nodes -key certificates/rootCA.key -sha256 -days 365 \
	  -out certificates/rootCA.crt -subj "/CN=MyLocalCA"
	
	openssl genrsa -out certificates/server.key 2048
	openssl req -new -key certificates/server.key -out certificates/server.csr \
	  -subj "/CN=postgres" \
	
	openssl x509 -req -in certificates/server.csr \
	  -CA certificates/rootCA.crt \
	  -CAkey certificates/rootCA.key \
	  -CAcreateserial \
	  -out certificates/server.crt \
	  -days 365 -sha256 \
	  -extfile <(printf "subjectAltName=DNS:postgres,DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:::1")
	
	openssl genrsa -out certificates/client.key 2048
	openssl req -new -key certificates/client.key -out certificates/client.csr \
	  -subj "/CN=postgres"
	
	openssl x509 -req -in certificates/client.csr \
	  -CA certificates/rootCA.crt \
	  -CAkey certificates/rootCA.key \
	  -CAcreateserial \
	  -out certificates/client.crt \
	  -days 365 -sha256
	
	openssl genrsa -out certificates/client_pgadmin.key 2048
	openssl req -new -key certificates/client_pgadmin.key -out certificates/client_pgadmin.csr \
	  -subj "/CN=postgres"
	
	openssl x509 -req -in certificates/client_pgadmin.csr \
	  -CA certificates/rootCA.crt \
	  -CAkey certificates/rootCA.key \
	  -CAcreateserial \
	  -out certificates/client_pgadmin.crt \
	  -days 365 -sha256


db_wipe: check
	podman-compose -f compose.yml up -d
	podman exec -u root transcendance_postgres_1 chmod -R a+rwX /var/lib/postgresql/
	rm -rf ./docker/.DB_data
	podman-compose -f compose.yml down

check:
	@echo -n "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]

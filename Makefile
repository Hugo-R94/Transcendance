SHELL := /bin/bash

.PHONY: all clean fclean re gen_cert up down check db_wipe

CERT = ./certificates

all: up
	ln -snf ../certificates backend/certificates
	cd backend && go build && ./backend

up: ${CERT}
	podman-compose -f compose.yml up -d --build

down:
	podman-compose -f compose.yml down

gen_cert: ${CERT}

${CERT}:
	mkdir -p certificates
	openssl genrsa -out certificates/rootCA.key 2048
	openssl req -x509 -new -nodes -key certificates/rootCA.key -sha256 -days 365 \
	  -out certificates/rootCA.crt -subj "/CN=MyLocalCA"
	
	openssl genrsa -out certificates/server.key 2048
	openssl req -new -key certificates/server.key -out certificates/server.csr \
	  -subj "/CN=postgres"
	
	printf "subjectAltName=DNS:postgres,DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:::1\n" > certificates/extfile.cnf
	openssl x509 -req -in certificates/server.csr \
	  -CA certificates/rootCA.crt \
	  -CAkey certificates/rootCA.key \
	  -CAcreateserial \
	  -out certificates/server.crt \
	  -days 365 -sha256 \
	  -extfile certificates/extfile.cnf
	rm -f certificates/extfile.cnf
	
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
	
	# Fixation des droits exigés par PostgreSQL et OpenSSL
	chmod 755 certificates
	chmod 644 certificates/*.crt
	chmod 600 certificates/*.key

clean:
	rm -rf certificates backend/certificates

fclean: clean
	rm -f Transcendance backend/backend

re: down fclean all

db_wipe: check
	podman-compose -f compose.yml down -v
	rm -rf ./podman/.DB_data

check:
	@read -p "Are you sure? [y/N] " ans && [[ "$$ans" =~ ^[Yy](es)?$$ ]]
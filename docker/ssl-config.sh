#!/bin/bash
set -e

# Configure PostgreSQL to use SSL
echo "ssl = on" >> /var/lib/postgresql/data/postgresql.conf
echo "ssl_cert_file = '/certificates/server.crt'" >> /var/lib/postgresql/data/postgresql.conf
echo "ssl_key_file = '/certificates/server.key'" >> /var/lib/postgresql/data/postgresql.conf
echo "ssl_ca_file = '/certificates/rootCA.crt'" >> /var/lib/postgresql/data/postgresql.conf

# Enforce SSL for all connections
echo "hostssl all all all cert clientcert=verify-full" > /var/lib/postgresql/data/pg_hba.conf
echo "local postgres postgres trust" >> /var/lib/postgresql/data/pg_hba.conf


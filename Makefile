NAME		= transcendence
export USER	:= $(shell whoami)
DATA_DIR	= /home/$(USER)/data
COMPOSE		= podman compose -f srcs/docker-compose.yml --env-file srcs/.env

IMAGES		= docker.io/library/golang:1.26.4-alpine \
		  docker.io/library/alpine:3.20 \
		  docker.io/library/node:22-alpine \
		  docker.io/library/nginx:1.27-alpine \
		  docker.io/library/postgres:16-alpine

all: up

setup:
	@mkdir -p $(DATA_DIR)/postgres $(DATA_DIR)/avatars $(DATA_DIR)/uploads

	@if [ ! -f $(DATA_DIR)/avatars/default_avatar.png ]; then \
		cp srcs/requirements/backend/avatars/avatar_default.png $(DATA_DIR)/avatars/default_avatar.png; \
		echo "Default avatar seeded to $(DATA_DIR)/avatars"; \
	fi
	@echo "Data directories ready at $(DATA_DIR)"

pull:
	@for img in $(IMAGES); do \
		echo "Pulling $$img..."; \
		podman pull $$img || exit 1; \
	done
	@echo "All base images pulled."

build: setup pull
	@$(COMPOSE) build

up: setup pull
	@$(COMPOSE) up -d --build

down:
	@$(COMPOSE) down

stop:
	@$(COMPOSE) stop

restart: down up

logs:
	@$(COMPOSE) logs -f

ps:
	@$(COMPOSE) ps

clean: down
	@podman system prune -f

fclean:
	@$(COMPOSE) down -v --rmi all
	@podman system prune -af

fclean_data: fclean
	@podman run --rm -v $(DATA_DIR):/data:Z docker.io/library/alpine:3.20 sh -c "rm -rf /data/*"
	@echo "Removed persisted data at $(DATA_DIR)"

re: fclean up

.PHONY: all setup pull build up down stop restart logs ps clean fclean fclean_data re

# Default environment variables
ENV ?= dev
COMPOSE_PROFILE ?= $(ENV)
COMPOSE := docker compose
YARN := yarn
APP_PORT ?= 3000
REDIS_PORT ?= 6380

# Ensure Docker is running
CHECK_DOCKER := $(shell docker info >/dev/null 2>&1 && echo "Docker is running" || echo "Docker is not running")
ifneq ($(CHECK_DOCKER),Docker is running)
  $(error Docker is not running. Please start Docker and try again.)
endif

.PHONY: help init build up down dev logs test clean lint redis-cli bash health performance prune

help: ## Display this help
	@echo "\nUsage: make [ENV=dev|prod] <target>\n"
	@echo "Environment Variables:"
	@echo "  ENV            Set to 'dev' or 'prod' (default: dev)"
	@echo "  APP_PORT       Application port (default: 3000)"
	@echo "  REDIS_PORT     Redis port (default: 6380)"
	@echo "\nTargets:"
	@awk 'BEGIN {FS = ":.*?##"; printf ""} /^[a-zA-Z_-]+:.*?##/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: ## Initialize project (install dependencies)
	@echo "Installing dependencies..."
	@$(COMPOSE) run --rm app $(YARN) install

build: ## Build containers (use BUILD_NO_CACHE=1 for no-cache build)
	@echo "Building containers for $(ENV)..."
	@if [ "$(BUILD_NO_CACHE)" = "1" ]; then \
		$(COMPOSE) --profile $(COMPOSE_PROFILE) build --no-cache; \
	else \
		$(COMPOSE) --profile $(COMPOSE_PROFILE) build; \
	fi

up: build ## Start containers in background
	@echo "Starting $(ENV) containers..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) up -d
	@echo "Application running at http://localhost:$(APP_PORT)"

down: ## Stop and remove containers
	@echo "Stopping containers..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) down

dev: ## Start development environment with hot-reloading
	@echo "Starting development environment..."
	@$(COMPOSE) --profile dev up --build --remove-orphans
	@echo "Development server running at http://localhost:$(APP_PORT)"

logs: ## View container logs (use LOGS_FOLLOW=0 to disable follow)
	@echo "Displaying logs..."
	@if [ "$(LOGS_FOLLOW)" = "0" ]; then \
		$(COMPOSE) --profile $(COMPOSE_PROFILE) logs; \
	else \
		$(COMPOSE) --profile $(COMPOSE_PROFILE) logs -f; \
	fi

test: ## Run tests
	@echo "Running tests..."
	@$(COMPOSE) --profile dev exec app $(YARN) test || { echo "Tests failed"; exit 1; }

lint: ## Run linter
	@echo "Running linter..."
	@$(COMPOSE) --profile dev exec app $(YARN) lint

clean: down ## Clean containers, volumes, and images (use FORCE_CLEAN=1 to prune all)
	@echo "Cleaning up..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) down -v
	@if [ "$(FORCE_CLEAN)" = "1" ]; then \
		echo "Pruning all unused Docker resources..."; \
		docker system prune -f --volumes; \
		docker builder prune -f; \
	fi

redis-cli: ## Access Redis CLI
	@echo "Accessing Redis CLI..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) exec redis redis-cli

bash: ## Access app container shell
	@echo "Accessing app container shell..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) exec app sh

health: ## Check container health
	@echo "Checking container health..."
	@$(COMPOSE) --profile $(COMPOSE_PROFILE) ps -a
	@docker inspect --format='{{.State.Health.Status}}' $$($(COMPOSE) --profile $(COMPOSE_PROFILE) ps -q app) || echo "App container not running"
	@docker inspect --format='{{.State.Health.Status}}' $$($(COMPOSE) --profile $(COMPOSE_PROFILE) ps -q redis) || echo "Redis container not running"

performance: ## Run performance tests (requires Lighthouse CLI)
	@echo "Running performance tests..."
	@docker run --rm -v $(PWD)/reports:/reports node:18-alpine sh -c "npm install -g lighthouse && lighthouse http://host.docker.internal:$(APP_PORT) --output=json --output-path=/reports/lighthouse.json"
	@echo "Performance report generated at reports/lighthouse.json"

prune: ## Prune unused Docker resources
	@echo "Pruning unused Docker resources..."
	@docker system prune -f
	@docker volume prune -f
	@docker builder prune -f
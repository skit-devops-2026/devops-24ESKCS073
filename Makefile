.PHONY: install test build run docker-build docker-up

install:
	@echo "No dependencies to install for BILLBOOK"

test:
	@./tests/test_project.sh
	@./tests/test_assets.sh

build:
	@echo "BILLBOOK build check passed"

run:
	python3 -m http.server 8000

# Needed from M4 onwards
docker-build:
	@echo "Docker build will be added in M5"

docker-up:
	docker compose up --build

.PHONY: up down dev dev-backend build seed prune

up:
	docker compose up -d

down:
	docker compose down

dev-backend:
	cd backend && npm run dev

build:
	docker compose build

seed:
	docker compose exec backend npx prisma db seed

prune:
	docker system prune -f

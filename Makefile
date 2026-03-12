test-all:
	node --test tests/*.test.js

build-extension:
	sh ./scripts/build-extension.sh

build-firefox-addon:
	sh ./scripts/build-firefox-addon.sh

deploy-stack:
	sh ./scripts/deploy-stack.sh

update-stack:
	docker compose up --build -d

stop-stack:
	docker compose stop

start-stack:
	docker compose start

backup-db:
	sh ./scripts/backup-db.sh

reset-stack:
	sh ./scripts/reset-stack.sh

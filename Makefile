test-all:
	node --test tests/*.test.js

backup-db:
	sh ./scripts/backup-db.sh

reset-stack:
	sh ./scripts/reset-stack.sh

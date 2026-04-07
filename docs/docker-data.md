# Docker data management and PostgreSQL export

Where Compose stores data, how to **export** the database to the host, how to restore, and how `docker compose down` relates to volumes.

## 1. Where data lives

- **Container writable layer**: Files not in a mounted path can be lost when the container is removed; do not rely on it for the database.
- **Named volumes**: In Compose, `postgres_data_*:/var/lib/postgresql/data` means PostgreSQL files live in a Docker-managed volume, mounted at `/var/lib/postgresql/data` in the container.

Persistence comes from **volumes**, not from the image. Prefer **`pg_dump` / `pg_restore`** (logical backup) over copying the image.

## 2. Export (recommended)

Run from the **repository root** while the stack is up. Default service name is `postgres`, database `miniboard`, user `postgres` (see compose files).

If you use a **named compose file**, pass `-f`, for example:

- Dev: `docker compose -f docker-compose.dev.yml …` (or plain `docker compose …` when the root [`docker-compose.yml`](../docker-compose.yml) `include`s the dev file)
- Prod-like: `docker compose -f docker-compose.prd.yml …`

Volume names depend on the project and file (e.g. `postgres_data_dev`, `postgres_data_prd`). Use `docker volume ls` to see them.

```bash
# Plain SQL (readable, portable)
docker compose exec -T postgres pg_dump -U postgres -d miniboard > backup-miniboard.sql

# Custom format (often better for larger DBs)
docker compose exec -T postgres pg_dump -U postgres -Fc -d miniboard > backup-miniboard.dump
```

- `exec` runs a command in a running container; `-T` avoids a TTY so redirection writes to a **host** file in the current directory.

## 3. Restore

**Use with care**: this writes into the existing database. Back up first in production.

```bash
# From SQL
docker compose exec -T postgres psql -U postgres -d miniboard < backup-miniboard.sql

# From custom format
docker compose exec -T postgres pg_restore -U postgres -d miniboard --clean < backup-miniboard.dump
```

## 4. Full data directory archive (advanced)

Copying the raw PGDATA directory is sensitive to versions and shutdown state; prefer `pg_dump` for routine work. To tar the volume, list volumes then run (replace `YOUR_VOLUME_NAME`):

```bash
docker volume ls

docker run --rm -v YOUR_VOLUME_NAME:/data -v "$(pwd)":/backup alpine \
  tar czf /backup/pgdata.tar.gz -C /data .
```

## 5. `docker compose down` and data

| Command | Named volumes |
|--------|----------------|
| `docker compose down` | **Kept**; data remains |
| `docker compose down -v` | **Volumes removed**; database data is wiped |

Use `-v` only when you intentionally want a clean slate.

#!/usr/bin/env bash
# Migrate video-stream from snap Docker to apt docker-ce on Ubuntu 25.04 (plucky).
# Safe-by-default: backs up the Postgres DB first and aborts if the backup is empty,
# BEFORE anything destructive (snap removal) happens.
set -euo pipefail

REPO=/root/video-stream
STAMP=$(date +%F_%H%M)
BACKUP=/root/authdb_backup_${STAMP}.sql

echo "################ PHASE 0: BACKUP (snap docker still running) ################"
cd "$REPO"
docker compose up -d postgres
# wait for postgres to accept connections
for i in $(seq 1 30); do
  if docker exec postgres pg_isready -U auth -d authdb >/dev/null 2>&1; then break; fi
  echo "  waiting for postgres... ($i)"; sleep 2
done
docker exec postgres pg_dump -U auth -d authdb --clean --if-exists --no-owner > "$BACKUP"
BYTES=$(wc -c < "$BACKUP")
echo "  backup written: $BACKUP ($BYTES bytes)"
if [ "$BYTES" -lt 100 ]; then
  echo "!! Backup looks empty ($BYTES bytes). ABORTING before any destructive step." >&2
  exit 1
fi
# extra safety: raw copy of the volume dir too
docker compose down
tar czf "/root/pgdata_volume_${STAMP}.tgz" \
  -C /var/snap/docker/common/var-lib-docker/volumes/video-stream_pgdata/_data . 2>/dev/null || true
echo "  raw volume archive: /root/pgdata_volume_${STAMP}.tgz"

echo "################ PHASE 1: STOP SNAP DOCKER ################"
snap stop docker || true

echo "################ PHASE 2: INSTALL apt docker-ce ################"
apt-get update
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

echo "################ PHASE 3: REMOVE SNAP DOCKER (data already backed up) ################"
snap remove docker || true

echo "  active docker now:"; command -v docker; docker --version
echo "  data-root:"; docker info --format '{{.DockerRootDir}}'   # expect /var/lib/docker

echo "################ PHASE 4: REBUILD STACK ON apt docker ################"
cd "$REPO"
docker compose up -d --build
# wait for the fresh postgres
for i in $(seq 1 30); do
  if docker exec postgres pg_isready -U auth -d authdb >/dev/null 2>&1; then break; fi
  echo "  waiting for new postgres... ($i)"; sleep 2
done

echo "################ PHASE 5: RESTORE DATABASE ################"
docker exec -i postgres psql -U auth -d authdb < "$BACKUP"
echo "  restore complete."

echo "################ DONE ################"
docker compose ps
echo "Backup kept at: $BACKUP  and  /root/pgdata_volume_${STAMP}.tgz"

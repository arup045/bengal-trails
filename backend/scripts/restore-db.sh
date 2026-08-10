#!/usr/bin/env bash
#
# restore-db.sh — decrypt + restore a Bengal Trails encrypted backup produced by
# .github/workflows/db-backup.yml.
#
# Usage:
#   BACKUP_ENCRYPTION_KEY='<your key>' DATABASE_URL='<target db url>' \
#     backend/scripts/restore-db.sh bengal-trails-YYYYMMDD-HHMMSS.pgc.enc
#
# ⚠️  DANGER: this uses --clean --if-exists, which DROPS existing objects before
#     restoring. Point DATABASE_URL at the intended target and be certain before
#     running — there is no undo. To preview first, run against a throwaway DB.
#
# Requires: openssl, and pg_restore >= the server major (PostgreSQL 18 client).

set -euo pipefail
# The decrypted dump holds user emails + bcrypt hashes. Force owner-only (0600)
# on every temp file this script creates so it is never world-readable in /tmp.
umask 077

ENC="${1:-}"
if [ -z "$ENC" ]; then
  echo "usage: restore-db.sh <backup.pgc.enc>" >&2
  exit 2
fi
if [ ! -f "$ENC" ]; then
  echo "error: file not found: $ENC" >&2
  exit 2
fi
: "${BACKUP_ENCRYPTION_KEY:?set BACKUP_ENCRYPTION_KEY to the passphrase used for the backup}"
: "${DATABASE_URL:?set DATABASE_URL to the TARGET database to restore into}"

# No .pgc suffix: appending it would name a NEW file and bypass mktemp's atomic
# 0600 creation. pg_restore detects the custom format from the archive header,
# not the extension, so openssl writes straight into mktemp's secure file.
tmp="$(mktemp "${TMPDIR:-/tmp}/bt-restore.XXXXXX")"
cleanup() { rm -f "$tmp"; }
trap cleanup EXIT

echo "→ Decrypting $ENC ..."
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ENC" -out "$tmp" -pass env:BACKUP_ENCRYPTION_KEY

echo "→ Restoring into the target database (this DROPS + recreates objects) ..."
# --single-transaction: the whole restore is atomic — a mid-restore error rolls
# everything back instead of leaving a half-populated DB. (Implies --exit-on-error.)
# Edge case: if the target lacks an OPTIONAL extension the dump uses (e.g. pgvector),
# that one CREATE EXTENSION aborts the whole transaction. If that happens, re-run
# WITHOUT --single-transaction to restore everything else best-effort:
#   pg_restore --no-owner --no-acl --clean --if-exists -d "$DATABASE_URL" "$tmp"
pg_restore --no-owner --no-acl --clean --if-exists --single-transaction -d "$DATABASE_URL" "$tmp"

echo "✅ Restore complete."

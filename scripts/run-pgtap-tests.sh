#!/usr/bin/env bash
# Runs the pgTAP RLS test suite (supabase/tests/database/*.sql).
#
# Two modes:
#   1. Against a real local Supabase stack (`supabase start` already
#      running): pass --supabase. Uses its Postgres on port 54322 as-is
#      (auth/storage schemas and roles are already real there) and skips
#      the standalone harness.
#   2. Against a plain local Postgres (no Docker/Supabase needed): the
#      default. Creates a scratch database, applies
#      scripts/pg-test-harness.sql to fake just enough of auth/storage,
#      then applies our real migrations before running the tests. This is
#      what CI or a Docker-less machine should use.
set -euo pipefail

MODE="standalone"
if [[ "${1:-}" == "--supabase" ]]; then
  MODE="supabase"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"
TESTS_DIR="$ROOT_DIR/supabase/tests/database"

if [[ "$MODE" == "supabase" ]]; then
  DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  echo "==> Running against local Supabase stack at $DB_URL"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/supabase/tests/database/00_helpers.sql"
  pg_prove -d "$DB_URL" "$TESTS_DIR"/*.sql
  exit $?
fi

DB_NAME="tattoo_crm_pgtap_test"
export PGUSER="${PGUSER:-postgres}"
# Deliberately NOT setting PGHOST: leave it unset so libpq connects over
# the local Unix socket (peer/trust auth), not TCP — pg_hba.conf commonly
# requires a password for 127.0.0.1 connections, which hangs forever with
# no TTY/PGPASSWORD to supply it.

echo "==> Recreating scratch database $DB_NAME"
dropdb --if-exists "$DB_NAME"
createdb "$DB_NAME"

echo "==> Applying standalone-Postgres auth/storage harness"
psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$SCRIPT_DIR/pg-test-harness.sql"

echo "==> Applying supabase/migrations/*.sql"
for f in "$MIGRATIONS_DIR"/*.sql; do
  echo "   - $(basename "$f")"
  psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "==> Applying test helpers"
psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$TESTS_DIR/00_helpers.sql"

echo "==> Running pgTAP tests"
pg_prove -d "$DB_NAME" "$TESTS_DIR"/0[1-9]_*.sql

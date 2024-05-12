#!/bin/sh
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE ROLE IF NOT EXISTS postgres;"
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" -1 /ros-database.sql

#!/bin/sh
set -e

# Create role 'postgres' if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='postgres'" | grep -q 1 || psql -U "$POSTGRES_USER" -d postgres -c "CREATE ROLE postgres;"

# Create database if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'" | grep -q 1 || psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"

# Restore the database and set ownership to 'rai'
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" -O "/ros-database.sql"

# Add owner 'rai' to all tables
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "ALTER TABLE ALL TABLES IN SCHEMA public OWNER TO rai;"

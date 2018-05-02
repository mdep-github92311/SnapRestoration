--
-- PostgreSQL database dump
--

-- Dumped from database version 10.0
-- Dumped by pg_dump version 10.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgmemento; Type: SCHEMA; Schema: -; Owner: ubuntu
--

CREATE SCHEMA pgmemento;


ALTER SCHEMA pgmemento OWNER TO ubuntu;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET search_path = pgmemento, pg_catalog;

--
-- Name: audit_table_check(bigint, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION audit_table_check(tid bigint, tab_name text, tab_schema text, OUT log_tab_oid oid, OUT log_tab_name text, OUT log_tab_schema text, OUT log_tab_id integer, OUT recent_tab_name text, OUT recent_tab_schema text, OUT recent_tab_id integer, OUT recent_tab_upper_txid numeric) RETURNS record
    LANGUAGE plpgsql STABLE STRICT
    AS $_$
DECLARE
  log_tab_upper_txid NUMERIC;
BEGIN
  -- try to get OID of table
  BEGIN
    log_tab_oid := ($3 || '.' || $2)::regclass::oid;

    EXCEPTION
      WHEN OTHERS THEN
        -- check if the table exists in audit_table_log
        SELECT
          relid INTO log_tab_oid
        FROM
          pgmemento.audit_table_log
        WHERE
          schema_name = $3
          AND table_name = $2
        LIMIT 1;

      IF log_tab_oid IS NULL THEN
        RAISE NOTICE 'Could not find table ''%'' in log tables.', $2;
        RETURN;
      END IF;
  END;

  -- check if the table existed when tid happened
  -- save schema and name in case it was renamed
  SELECT
    id,
    schema_name,
    table_name,
    upper(txid_range)
  INTO
    log_tab_id,
    log_tab_schema,
    log_tab_name,
    log_tab_upper_txid 
  FROM
    pgmemento.audit_table_log 
  WHERE
    relid = log_tab_oid
    AND txid_range @> $1::numeric;

  IF NOT FOUND THEN
    RAISE NOTICE 'Table ''%'' did not exist for requested txid range.', $3;
    RETURN;
  END IF;

  -- take into account that the table might not exist anymore or it has been renamed
  -- try to find out if there is an active table with the same oid
  IF log_tab_upper_txid IS NOT NULL THEN
    SELECT
      id,
      schema_name,
      table_name,
      upper(txid_range)
    INTO
      recent_tab_id,
      recent_tab_schema,
      recent_tab_name,
      recent_tab_upper_txid
    FROM
      pgmemento.audit_table_log 
    WHERE
      relid = log_tab_oid
      AND upper(txid_range) IS NULL
      AND lower(txid_range) IS NOT NULL;
  END IF;

  -- if not, set new_tab_* attributes, as we need them later
  IF recent_tab_id IS NULL THEN
    recent_tab_id := log_tab_id;
    recent_tab_schema := log_tab_schema;
    recent_tab_name := log_tab_name;
    recent_tab_upper_txid := log_tab_upper_txid;
  END IF;

  RETURN;
END;
$_$;


ALTER FUNCTION pgmemento.audit_table_check(tid bigint, tab_name text, tab_schema text, OUT log_tab_oid oid, OUT log_tab_name text, OUT log_tab_schema text, OUT log_tab_id integer, OUT recent_tab_name text, OUT recent_tab_schema text, OUT recent_tab_id integer, OUT recent_tab_upper_txid numeric) OWNER TO ubuntu;

--
-- Name: create_restore_template(bigint, text, text, text, integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_restore_template(tid bigint, template_name text, table_name text, schema_name text, preserve_template integer DEFAULT 0) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  stmt TEXT;
BEGIN
  -- get columns that exist at transaction with id end_at_tid
  SELECT
    string_agg(
      c.column_name
      || ' '
      || c.data_type
      || CASE WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default ELSE '' END
      || CASE WHEN c.not_null THEN ' NOT NULL' ELSE '' END,
      ', ' ORDER BY c.ordinal_position
    ) INTO stmt
  FROM
    pgmemento.audit_column_log c
  JOIN
    pgmemento.audit_table_log t
    ON t.id = c.audit_table_id
  WHERE
    t.table_name = $3
    AND t.schema_name = $4
    AND t.txid_range @> $1::numeric
    AND c.txid_range @> $1::numeric;

  -- create temp table
  IF stmt IS NOT NULL THEN
    EXECUTE format(
      'CREATE TEMPORARY TABLE IF NOT EXISTS %I ('
         || stmt
         || ', audit_id bigint DEFAULT nextval(''pgmemento.audit_id_seq''::regclass) unique not null'
         || ') '
         || CASE WHEN $5 <> 0 THEN 'ON COMMIT PRESERVE ROWS' ELSE 'ON COMMIT DROP' END,
       $2);
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.create_restore_template(tid bigint, template_name text, table_name text, schema_name text, preserve_template integer) OWNER TO ubuntu;

--
-- Name: create_schema_audit(text, integer, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_schema_audit(schema_name text DEFAULT 'public'::text, log_state integer DEFAULT 1, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.create_table_audit(c.relname, $1, $2)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($3,'{}')); 
$_$;


ALTER FUNCTION pgmemento.create_schema_audit(schema_name text, log_state integer, except_tables text[]) OWNER TO ubuntu;

--
-- Name: create_schema_audit_id(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_schema_audit_id(schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.create_table_audit_id(c.relname, $1)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}'));
$_$;


ALTER FUNCTION pgmemento.create_schema_audit_id(schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: create_schema_event_trigger(integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_schema_event_trigger(trigger_create_table integer DEFAULT 0) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $$
BEGIN
  -- Create event trigger for DROP SCHEMA events to log data
  -- before it is lost
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
      WHERE evtname = 'schema_drop_pre_trigger'
  ) THEN
    CREATE EVENT TRIGGER schema_drop_pre_trigger ON ddl_command_start
      WHEN TAG IN ('DROP SCHEMA')
        EXECUTE PROCEDURE pgmemento.schema_drop_pre_trigger();
  END IF;

  -- Create event trigger for ALTER TABLE events to update 'audit_column_log' table
  -- after table is altered
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
      WHERE evtname = 'table_alter_post_trigger'
  ) THEN
    CREATE EVENT TRIGGER table_alter_post_trigger ON ddl_command_end
      WHEN TAG IN ('ALTER TABLE')
        EXECUTE PROCEDURE pgmemento.table_alter_post_trigger();
  END IF;

  -- Create event trigger for ALTER TABLE events to log data
  -- before table is altered
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
      WHERE evtname = 'table_alter_pre_trigger'
  ) THEN
    CREATE EVENT TRIGGER table_alter_pre_trigger ON ddl_command_start
      WHEN TAG IN ('ALTER TABLE')
        EXECUTE PROCEDURE pgmemento.table_alter_pre_trigger();
  END IF;

  -- Create event trigger for CREATE TABLE events to automatically start auditing on new tables
  -- The user can decide if he wants this behaviour during initializing pgMemento.
  IF trigger_create_table <> 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_event_trigger
        WHERE evtname = 'table_create_post_trigger'
    ) THEN
      CREATE EVENT TRIGGER table_create_post_trigger ON ddl_command_end
        WHEN TAG IN ('CREATE TABLE')
          EXECUTE PROCEDURE pgmemento.table_create_post_trigger();
    END IF;
  END IF;

  -- Create event trigger for DROP TABLE events to update tables 'audit_table_log' and 'audit_column_log'
  -- after table is dropped
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
      WHERE evtname = 'table_drop_post_trigger'
  ) THEN
    CREATE EVENT TRIGGER table_drop_post_trigger ON sql_drop
      WHEN TAG IN ('DROP TABLE')
        EXECUTE PROCEDURE pgmemento.table_drop_post_trigger();
  END IF;

  -- Create event trigger for DROP TABLE events to log data
  -- before it is lost
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
      WHERE evtname = 'table_drop_pre_trigger'
  ) THEN
    CREATE EVENT TRIGGER table_drop_pre_trigger ON ddl_command_start
      WHEN TAG IN ('DROP TABLE')
        EXECUTE PROCEDURE pgmemento.table_drop_pre_trigger();
  END IF;
END;
$$;


ALTER FUNCTION pgmemento.create_schema_event_trigger(trigger_create_table integer) OWNER TO ubuntu;

--
-- Name: create_schema_log_trigger(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_schema_log_trigger(schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.create_table_log_trigger(c.relname, $1)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}'));
$_$;


ALTER FUNCTION pgmemento.create_schema_log_trigger(schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: create_table_audit(text, text, integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_table_audit(table_name text, schema_name text DEFAULT 'public'::text, log_state integer DEFAULT 1) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  -- create log trigger
  PERFORM pgmemento.create_table_log_trigger($1, $2);

  -- add audit_id column
  PERFORM pgmemento.create_table_audit_id($1, $2);

  -- log existing table content as inserted
  IF $3 = 1 THEN
    PERFORM pgmemento.log_table_state($1, $2);
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.create_table_audit(table_name text, schema_name text, log_state integer) OWNER TO ubuntu;

--
-- Name: create_table_audit_id(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_table_audit_id(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  -- add 'audit_id' column to table if it does not exist, yet
  IF NOT EXISTS (
    SELECT
      1
    FROM
      pg_attribute
    WHERE
      attrelid = ($2 || '.' || $1)::regclass
      AND attname = 'audit_id'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'ALTER TABLE %I.%I ADD COLUMN audit_id BIGINT DEFAULT nextval(''pgmemento.audit_id_seq''::regclass) UNIQUE NOT NULL',
      $2, $1);
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.create_table_audit_id(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: create_table_log_trigger(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION create_table_log_trigger(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  IF EXISTS (
    SELECT
      1
    FROM
      pg_trigger
    WHERE
      tgrelid = ($2 || '.' || $1)::regclass::oid
      AND tgname = 'log_transaction_trigger'
  ) THEN
    RETURN;
  ELSE
    /*
      statement level triggers
    */
    -- first trigger to be fired on each transaction
    EXECUTE format(
      'CREATE TRIGGER log_transaction_trigger
         BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON %I.%I
         FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction()',
         $2, $1);

    -- second trigger to be fired before truncate events 
    EXECUTE format(
      'CREATE TRIGGER log_truncate_trigger 
         BEFORE TRUNCATE ON %I.%I
         FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate()',
         $2, $1);

    /*
      row level triggers
    */
    -- trigger to be fired after insert events
    EXECUTE format(
      'CREATE TRIGGER log_insert_trigger
         AFTER INSERT ON %I.%I
         FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert()',
         $2, $1);

    -- trigger to be fired after update events
    EXECUTE format(
      'CREATE TRIGGER log_update_trigger
         AFTER UPDATE ON %I.%I
         FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update()',
         $2, $1);

    -- trigger to be fired after insert events
    EXECUTE format(
      'CREATE TRIGGER log_delete_trigger
         AFTER DELETE ON %I.%I
         FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete()',
         $2, $1);
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.create_table_log_trigger(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: delete_audit_table_log(integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION delete_audit_table_log(table_oid integer) RETURNS SETOF oid
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  -- only allow delete if table has already been dropped
  IF EXISTS (
    SELECT
      1
    FROM
      pgmemento.audit_table_log 
    WHERE
      relid = $1
      AND upper(txid_range) IS NOT NULL
  ) THEN
    -- remove corresponding table events from event log
    DELETE FROM
      pgmemento.table_event_log 
    WHERE
      table_relid = $1;

    RETURN QUERY
      DELETE FROM
        pgmemento.audit_table_log 
      WHERE
        relid = $1
        AND upper(txid_range) IS NOT NULL
      RETURNING
        relid;
  ELSE
    RAISE NOTICE 'Either audit table with relid % is not found or the table still exists.', $1; 
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.delete_audit_table_log(table_oid integer) OWNER TO ubuntu;

--
-- Name: delete_key(bigint, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION delete_key(aid bigint, key_name text) RETURNS SETOF bigint
    LANGUAGE sql STRICT
    AS $_$
UPDATE
  pgmemento.row_log
SET
  changes = changes - $2
WHERE
  audit_id = $1
RETURNING
  id;
$_$;


ALTER FUNCTION pgmemento.delete_key(aid bigint, key_name text) OWNER TO ubuntu;

--
-- Name: delete_table_event_log(bigint, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION delete_table_event_log(tid bigint, table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF integer
    LANGUAGE sql STRICT
    AS $_$
DELETE FROM
  pgmemento.table_event_log e
USING
  pgmemento.audit_table_log a
WHERE
  e.table_relid = a.relid
  AND e.transaction_id = $1
  AND a.schema_name = $3
  AND a.table_name = $2
  AND a.txid_range @> $1::numeric
RETURNING
  e.id;
$_$;


ALTER FUNCTION pgmemento.delete_table_event_log(tid bigint, table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: delete_txid_log(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION delete_txid_log(t_id bigint) RETURNS bigint
    LANGUAGE sql STRICT
    AS $_$
DELETE FROM
  pgmemento.transaction_log
WHERE
  txid = $1
RETURNING
  txid;
$_$;


ALTER FUNCTION pgmemento.delete_txid_log(t_id bigint) OWNER TO ubuntu;

--
-- Name: drop_schema_audit(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_schema_audit(schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.drop_table_audit(c.relname, $1)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}'));
$_$;


ALTER FUNCTION pgmemento.drop_schema_audit(schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: drop_schema_audit_id(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_schema_audit_id(schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.drop_table_audit_id(c.relname, $1)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}'));
$_$;


ALTER FUNCTION pgmemento.drop_schema_audit_id(schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: drop_schema_event_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_schema_event_trigger() RETURNS SETOF void
    LANGUAGE sql
    AS $$
  DROP EVENT TRIGGER IF EXISTS schema_drop_pre_trigger;
  DROP EVENT TRIGGER IF EXISTS table_alter_post_trigger;
  DROP EVENT TRIGGER IF EXISTS table_alter_pre_trigger;
  DROP EVENT TRIGGER IF EXISTS table_create_post_trigger;
  DROP EVENT TRIGGER IF EXISTS table_drop_post_trigger;
  DROP EVENT TRIGGER IF EXISTS table_drop_pre_trigger;
$$;


ALTER FUNCTION pgmemento.drop_schema_event_trigger() OWNER TO ubuntu;

--
-- Name: drop_schema_log_trigger(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_schema_log_trigger(schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.drop_table_log_trigger(c.relname, $1)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}'));
$_$;


ALTER FUNCTION pgmemento.drop_schema_log_trigger(schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: drop_schema_state(text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_schema_state(target_schema_name text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.drop_table_state(c.relname, n.nspname)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $1
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($2,'{}')); 
$_$;


ALTER FUNCTION pgmemento.drop_schema_state(target_schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: drop_table_audit(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_table_audit(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  -- drop audit_id column
  PERFORM pgmemento.drop_table_audit_id($1, $2);

  -- drop log trigger
  PERFORM pgmemento.drop_table_log_trigger($1, $2);
END;
$_$;


ALTER FUNCTION pgmemento.drop_table_audit(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: drop_table_audit_id(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_table_audit_id(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  -- drop 'audit_id' column if it exists
  IF EXISTS (
    SELECT
      1
    FROM
      pg_attribute
    WHERE
      attrelid = ($2 || '.' || $1)::regclass::oid
      AND attname = 'audit_id'
      AND attislocal = 't'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'ALTER TABLE %I.%I DROP COLUMN audit_id',
      $2, $1);

    -- update audit_table_log and audit_column_log
    PERFORM pgmemento.unregister_audit_table($1, $2);
  ELSE
    RETURN;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.drop_table_audit_id(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: drop_table_log_trigger(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_table_log_trigger(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS log_delete_trigger ON %I.%I', $2, $1);
  EXECUTE format('DROP TRIGGER IF EXISTS log_update_trigger ON %I.%I', $2, $1);
  EXECUTE format('DROP TRIGGER IF EXISTS log_insert_trigger ON %I.%I', $2, $1);
  EXECUTE format('DROP TRIGGER IF EXISTS log_truncate_trigger ON %I.%I', $2, $1);
  EXECUTE format('DROP TRIGGER IF EXISTS log_transaction_trigger ON %I.%I', $2, $1);
END;
$_$;


ALTER FUNCTION pgmemento.drop_table_log_trigger(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: drop_table_state(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION drop_table_state(table_name text, target_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  fkey TEXT;
BEGIN
  -- dropping depending references to given table
  FOR fkey IN
    SELECT
      conname
    FROM
      pg_constraint
    WHERE
      conrelid = ($2 || '.' || $1)::regclass::oid
      AND contype = 'f'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT %I',
      $2, $1, fkey);
  END LOOP;

  -- hit the log_truncate_trigger
  EXECUTE format(
    'TRUNCATE TABLE %I.%I CASCADE',
    $2, $1);

  -- dropping the table
  EXECUTE format(
    'DROP TABLE %I.%I CASCADE',
    $2, $1);
END;
$_$;


ALTER FUNCTION pgmemento.drop_table_state(table_name text, target_schema_name text) OWNER TO ubuntu;

--
-- Name: fkey_schema_state(text, text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION fkey_schema_state(target_schema_name text, original_schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.fkey_table_state(c.relname, $1, n.nspname)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $2
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($3,'{}')); 
$_$;


ALTER FUNCTION pgmemento.fkey_schema_state(target_schema_name text, original_schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: fkey_table_state(text, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION fkey_table_state(table_name text, target_schema_name text, original_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  fkey RECORD;
BEGIN
  -- rebuild foreign key constraints
  FOR fkey IN 
    SELECT
      c.conname AS fkey_name,
      a.attname AS fkey_column,
      t.relname AS ref_table,
      a_ref.attname AS ref_column,
      CASE c.confupdtype
        WHEN 'a' THEN 'no action'
        WHEN 'r' THEN 'restrict'
        WHEN 'c' THEN 'cascade'
        WHEN 'n' THEN 'set null'
        WHEN 'd' THEN 'set default'
	  END AS on_up,
      CASE c.confdeltype
        WHEN 'a' THEN 'no action'
        WHEN 'r' THEN 'restrict'
        WHEN 'c' THEN 'cascade'
        WHEN 'n' THEN 'set null'
        WHEN 'd' THEN 'set default'
	  END AS on_del,
      CASE c.confmatchtype
        WHEN 'f' THEN 'full'
        WHEN 'p' THEN 'partial'
        WHEN 'u' THEN 'simple'
      END AS mat
    FROM
      pg_constraint c
    JOIN
      pg_attribute a
      ON a.attrelid = c.conrelid
      AND a.attnum = ANY (c.conkey)
    JOIN
      pg_attribute a_ref
      ON a_ref.attrelid = c.confrelid
      AND a_ref.attnum = ANY (c.confkey)
    JOIN
      pg_class t
      ON t.oid = a_ref.attrelid
    WHERE
      c.conrelid = ($3 || '.' || $1)::regclass::oid
      AND c.contype = 'f'
  LOOP
    BEGIN
      -- test query
      EXECUTE format(
        'SELECT 1 FROM %I.%I a, %I.%I b WHERE a.%I = b.%I LIMIT 1',
        $2, $1, $2, fkey.ref_table, fkey.fkey_column, fkey.ref_column);

      -- recreate foreign key of original table
      EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I ON UPDATE %I ON DELETE %I MATCH %I',
        $2, $1, fkey.fkey_name, fkey.fkey_column, $2, fkey.ref_table, fkey.ref_column, fkey.on_up, fkey.on_del, fkey.mat);

      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Could not recreate foreign key constraint ''%'' on table ''%'': %', fkey.fkey_name, $1, SQLERRM;
          NULL;
    END;
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.fkey_table_state(table_name text, target_schema_name text, original_schema_name text) OWNER TO ubuntu;

--
-- Name: generate_log_entries(bigint, bigint, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION generate_log_entries(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text) RETURNS SETOF jsonb
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  -- init query string
  restore_query TEXT := pgmemento.restore_query($1, $2, $3, $4);
BEGIN
  -- execute the SQL command
  RETURN QUERY EXECUTE restore_query;
END;
$_$;


ALTER FUNCTION pgmemento.generate_log_entries(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: generate_log_entry(bigint, bigint, text, text, bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION generate_log_entry(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text, aid bigint) RETURNS jsonb
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  -- init query string
  restore_query TEXT := pgmemento.restore_query($1, $2, $3, $4, $5);
  jsonb_result JSONB := '{}'::jsonb;
BEGIN
  -- execute the SQL command
  EXECUTE restore_query INTO jsonb_result;
  RETURN jsonb_result;
END;
$_$;


ALTER FUNCTION pgmemento.generate_log_entry(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text, aid bigint) OWNER TO ubuntu;

--
-- Name: get_ddl_from_context(text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION get_ddl_from_context(stack text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $_$
DECLARE
  ddl_text TEXT;
  objs TEXT[] := '{}';
  do_next BOOLEAN := TRUE;
  ddl_pos INTEGER;
BEGIN
  -- split context by lines
  objs := regexp_split_to_array($1, E'\\n+');

  -- if context is greater than 1 line, trigger was fired from inside a function
  IF array_length(objs,1) > 1 THEN
    FOR i IN 2..array_length(objs,1) LOOP
      EXIT WHEN do_next = FALSE;
      -- try to find starting position of DDL command
      ddl_pos := GREATEST(
                   position('ALTER TABLE' IN objs[i]),
                   position('DROP TABLE' IN objs[i]),
                   position('DROP SCHEMA' IN objs[i])
                 );
      IF ddl_pos > 0 THEN
        ddl_text := substr(objs[2], ddl_pos, length(objs[2]) - ddl_pos);
        do_next := FALSE;
      END IF;
    END LOOP;
  END IF;

  RETURN ddl_text;
END;
$_$;


ALTER FUNCTION pgmemento.get_ddl_from_context(stack text) OWNER TO ubuntu;

--
-- Name: get_max_txid_to_audit_id(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION get_max_txid_to_audit_id(aid bigint) RETURNS bigint
    LANGUAGE sql STABLE STRICT
    AS $_$
SELECT
  max(t.txid)
FROM
  pgmemento.transaction_log t
JOIN
  pgmemento.table_event_log e
  ON e.transaction_id = t.txid
JOIN
  pgmemento.row_log r
  ON r.event_id = e.id
WHERE
  r.audit_id = $1;
$_$;


ALTER FUNCTION pgmemento.get_max_txid_to_audit_id(aid bigint) OWNER TO ubuntu;

--
-- Name: get_min_txid_to_audit_id(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION get_min_txid_to_audit_id(aid bigint) RETURNS bigint
    LANGUAGE sql STABLE STRICT
    AS $_$
SELECT
  min(t.txid)
FROM
  pgmemento.transaction_log t
JOIN
  pgmemento.table_event_log e
  ON e.transaction_id = t.txid
JOIN
  pgmemento.row_log r
  ON r.event_id = e.id
WHERE
  r.audit_id = $1;
$_$;


ALTER FUNCTION pgmemento.get_min_txid_to_audit_id(aid bigint) OWNER TO ubuntu;

--
-- Name: get_txid_bounds_to_table(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION get_txid_bounds_to_table(table_name text, schema_name text DEFAULT 'public'::text, OUT txid_min bigint, OUT txid_max bigint) RETURNS record
    LANGUAGE sql STABLE STRICT
    AS $_$
SELECT
  min(transaction_id) AS txid_min,
  max(transaction_id) AS txid_max
FROM
  pgmemento.table_event_log 
WHERE
  table_relid = ($2 || '.' || $1)::regclass::oid;
$_$;


ALTER FUNCTION pgmemento.get_txid_bounds_to_table(table_name text, schema_name text, OUT txid_min bigint, OUT txid_max bigint) OWNER TO ubuntu;

--
-- Name: get_txids_to_audit_id(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION get_txids_to_audit_id(aid bigint) RETURNS SETOF bigint
    LANGUAGE sql STABLE STRICT
    AS $_$
SELECT
  t.txid
FROM
  pgmemento.transaction_log t
JOIN
  pgmemento.table_event_log e
  ON e.transaction_id = t.txid
JOIN
  pgmemento.row_log r
  ON r.event_id = e.id
WHERE
  r.audit_id = $1;
$_$;


ALTER FUNCTION pgmemento.get_txids_to_audit_id(aid bigint) OWNER TO ubuntu;

--
-- Name: index_schema_state(text, text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION index_schema_state(target_schema_name text, original_schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.index_table_state(c.relname, $1, n.nspname)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $2
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($3,'{}')); 
$_$;


ALTER FUNCTION pgmemento.index_schema_state(target_schema_name text, original_schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: index_table_state(text, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION index_table_state(table_name text, target_schema_name text, original_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  stmt TEXT;
BEGIN
  -- rebuild user defined indexes
  FOR stmt IN 
    SELECT
      replace(pg_get_indexdef(c.oid),' ON ', format(' ON %I.', $2))
    FROM
      pg_index i
    JOIN
      pg_class c
      ON c.oid = i.indexrelid
    WHERE
      i.indrelid = ($3 || '.' || $1)::regclass
      AND i.indisprimary = 'f'
  LOOP
    BEGIN
      EXECUTE stmt;

      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Could not recreate index ''%'' on table ''%'': %', idx.idx_name, $1, SQLERRM;
    END;
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.index_table_state(table_name text, target_schema_name text, original_schema_name text) OWNER TO ubuntu;

--
-- Name: log_ddl_event(text, text, integer, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_ddl_event(table_name text, schema_name text, op_type integer, op_text text) RETURNS integer
    LANGUAGE plpgsql
    AS $_$
DECLARE
  e_id INTEGER;
  table_oid OID;
BEGIN
  -- log transaction of ddl event
  -- on conflict do nothing
  INSERT INTO pgmemento.transaction_log 
    (txid, stmt_date, user_name, client_name)
  VALUES
    (txid_current(), statement_timestamp(), current_user, inet_client_addr())
  ON CONFLICT (txid)
    DO NOTHING;

  IF table_name IS NOT NULL AND schema_name IS NOT NULL THEN
    table_oid := ($2 || '.' || $1)::regclass::oid;
  END IF;

  -- try to log corresponding table event
  -- on conflict do dummy update to get event_id
  INSERT INTO pgmemento.table_event_log 
    (transaction_id, op_id, table_operation, table_relid) 
  VALUES
    (txid_current(), $3, $4, table_oid)
  ON CONFLICT (transaction_id, table_relid, op_id)
    DO UPDATE SET op_id = $3 RETURNING id INTO e_id;

  RETURN e_id;
END;
$_$;


ALTER FUNCTION pgmemento.log_ddl_event(table_name text, schema_name text, op_type integer, op_text text) OWNER TO ubuntu;

--
-- Name: log_delete(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  e_id INTEGER;
BEGIN
  -- get corresponding table event as it has already been logged
  -- by the log_transaction_trigger in advance
  SELECT
    id INTO e_id
  FROM
    pgmemento.table_event_log 
  WHERE
    transaction_id = txid_current() 
    AND table_relid = TG_RELID
    AND op_id = 7;

  -- log content of the entire row in the row_log table
  INSERT INTO pgmemento.row_log
    (event_id, audit_id, changes)
  VALUES
    (e_id, OLD.audit_id, to_jsonb(OLD));

  RETURN NULL;
END;
$$;


ALTER FUNCTION pgmemento.log_delete() OWNER TO ubuntu;

--
-- Name: log_insert(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  e_id INTEGER;
BEGIN
  -- get corresponding table event as it has already been logged
  -- by the log_transaction_trigger in advance
  SELECT
    id INTO e_id
  FROM
    pgmemento.table_event_log 
  WHERE
    transaction_id = txid_current() 
    AND table_relid = TG_RELID
    AND op_id = 3;

  -- log inserted row ('changes' column can be left blank)
  INSERT INTO pgmemento.row_log
    (event_id, audit_id)
  VALUES
    (e_id, NEW.audit_id);
			 
  RETURN NULL;
END;
$$;


ALTER FUNCTION pgmemento.log_insert() OWNER TO ubuntu;

--
-- Name: log_schema_state(text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_schema_state(schemaname text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE sql STRICT
    AS $_$
SELECT
  pgmemento.log_table_state(a.table_name, a.schema_name)
FROM
  pgmemento.audit_table_log a,
  pgmemento.audit_tables_dependency d
WHERE
  a.schema_name = d.schemaname
  AND a.table_name = d.tablename
  AND a.schema_name = $1
  AND d.schemaname = $1
  AND upper(a.txid_range) IS NULL
  AND lower(a.txid_range) IS NOT NULL
ORDER BY
  d.depth;
$_$;


ALTER FUNCTION pgmemento.log_schema_state(schemaname text) OWNER TO ubuntu;

--
-- Name: log_table_state(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_table_state(table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  is_empty INTEGER := 0;
  e_id INTEGER;
  pkey_columns TEXT := '';
BEGIN
  -- first, check if table is not empty
  EXECUTE format(
    'SELECT 1 FROM %I.%I LIMIT 1',
    $2, $1)
    INTO is_empty;

  IF is_empty <> 0 THEN
    RAISE NOTICE 'Log existing data in table %.% as inserted', $1, $2;

    -- fill transaction_log table 
    INSERT INTO pgmemento.transaction_log
      (txid, stmt_date, user_name, client_name)
    VALUES 
      (txid_current(), statement_timestamp(), current_user, inet_client_addr())
    ON CONFLICT (txid)
      DO NOTHING;

    -- fill table_event_log table  
    INSERT INTO pgmemento.table_event_log
      (transaction_id, op_id, table_operation, table_relid) 
    VALUES
      (txid_current(), 3, 'INSERT', ($2 || '.' || $1)::regclass::oid)
    ON CONFLICT (transaction_id, table_relid, op_id)
      DO NOTHING
      RETURNING id INTO e_id;

    -- fill row_log table
    IF e_id IS NOT NULL THEN
      -- get the primary key columns
      SELECT
        array_to_string(array_agg(pga.attname),',') INTO pkey_columns
      FROM
        pg_index pgi,
        pg_class pgc,
        pg_attribute pga 
      WHERE
        pgc.oid = ($2 || '.' || $1)::regclass::oid
        AND pgi.indrelid = pgc.oid 
        AND pga.attrelid = pgc.oid 
        AND pga.attnum = ANY(pgi.indkey)
        AND pgi.indisprimary;

      IF pkey_columns IS NOT NULL THEN
        pkey_columns := ' ORDER BY ' || pkey_columns;
      ELSE
        pkey_columns := ' ORDER BY audit_id';
      END IF;

      EXECUTE format(
        'INSERT INTO pgmemento.row_log (event_id, audit_id, changes)
           SELECT $1, audit_id, NULL::jsonb AS changes FROM %I.%I' || pkey_columns,
           $2, $1) USING e_id;
    END IF;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.log_table_state(table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: log_transaction(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  operation_id SMALLINT;
BEGIN
  -- try to log corresponding transaction
  INSERT INTO pgmemento.transaction_log 
    (txid, stmt_date, user_name, client_name)
  VALUES 
    (txid_current(), statement_timestamp(), current_user, inet_client_addr())
  ON CONFLICT (txid)
    DO NOTHING;

  -- assign id for operation type
  CASE TG_OP
    WHEN 'INSERT' THEN operation_id := 3;
    WHEN 'UPDATE' THEN operation_id := 4;
    WHEN 'DELETE' THEN operation_id := 7;
    WHEN 'TRUNCATE' THEN operation_id := 8;
  END CASE;

  -- try to log corresponding table event
  -- on conflict do nothing
  INSERT INTO pgmemento.table_event_log 
    (transaction_id, op_id, table_operation, table_relid) 
  VALUES
    (txid_current(), operation_id, TG_OP, TG_RELID)
  ON CONFLICT (transaction_id, table_relid, op_id)
    DO NOTHING;

  RETURN NULL;
END;
$$;


ALTER FUNCTION pgmemento.log_transaction() OWNER TO ubuntu;

--
-- Name: log_truncate(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  e_id INTEGER;
BEGIN
  -- get corresponding table event as it has already been logged
  -- by the log_transaction_trigger in advance
  SELECT
    id INTO e_id
  FROM
    pgmemento.table_event_log 
  WHERE
    transaction_id = txid_current() 
    AND table_relid = TG_RELID
    AND op_id = 8;

  -- log the whole content of the truncated table in the row_log table
  EXECUTE format(
    'INSERT INTO pgmemento.row_log (event_id, audit_id, changes)
       SELECT $1, audit_id, to_jsonb(%I) AS content FROM %I.%I',
       TG_TABLE_NAME, TG_TABLE_SCHEMA, TG_TABLE_NAME
    ) USING e_id;

  RETURN NULL;
END;
$_$;


ALTER FUNCTION pgmemento.log_truncate() OWNER TO ubuntu;

--
-- Name: log_update(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION log_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  e_id INTEGER;
  jsonb_diff JSONB;
BEGIN
  -- get corresponding table event as it has already been logged
  -- by the log_transaction_trigger in advance
  SELECT
    id INTO e_id
  FROM
    pgmemento.table_event_log 
  WHERE
    transaction_id = txid_current() 
    AND table_relid = TG_RELID
    AND op_id = 4;

  -- log values of updated columns for the processed row
  -- therefore, a diff between OLD and NEW is necessary
  SELECT COALESCE(
    (SELECT
       ('{' || string_agg(to_json(key) || ':' || value, ',') || '}') 
     FROM
       jsonb_each(to_jsonb(OLD))
     WHERE
       NOT ('{' || to_json(key) || ':' || value || '}')::jsonb <@ to_jsonb(NEW)
    ),
    '{}')::jsonb INTO jsonb_diff;

  IF jsonb_diff <> '{}'::jsonb THEN
    INSERT INTO pgmemento.row_log
      (event_id, audit_id, changes)
    VALUES 
      (e_id, NEW.audit_id, jsonb_diff);
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION pgmemento.log_update() OWNER TO ubuntu;

--
-- Name: modify_ddl_log_tables(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION modify_ddl_log_tables(tablename text, schemaname text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  tab_id INTEGER;
  column_ids int[] := '{}';
BEGIN
  -- get id from audit_table_log for given table
  tab_id := pgmemento.register_audit_table($1,$2);

  IF tab_id IS NOT NULL THEN
    -- EVENT: New column created
    -- insert columns that do not exist in audit_column_log table
    WITH added_columns AS (
      INSERT INTO pgmemento.audit_column_log
        (id, audit_table_id, column_name, ordinal_position, data_type, column_default, not_null, txid_range)
      (
        SELECT 
          nextval('pgmemento.audit_column_log_id_seq') AS id,
          tab_id AS audit_table_id,
          a.attname AS column_name,
          a.attnum AS ordinal_position,
          substr(
            format_type(a.atttypid, a.atttypmod),
            position('.' IN format_type(a.atttypid, a.atttypmod))+1,
            length(format_type(a.atttypid, a.atttypmod))
          ) AS data_type,
          d.adsrc AS column_default,
          a.attnotnull AS not_null,
          numrange(txid_current(), NULL, '[)') AS txid_range
        FROM
          pg_attribute a
        LEFT JOIN
          pg_attrdef d
          ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
        LEFT JOIN (
          SELECT
            a.table_name,
            c.column_name,
            a.schema_name
          FROM
            pgmemento.audit_column_log c
          JOIN
            pgmemento.audit_table_log a ON a.id = c.audit_table_id
          WHERE
            a.id = tab_id
            AND upper(a.txid_range) IS NULL
            AND lower(a.txid_range) IS NOT NULL
            AND upper(c.txid_range) IS NULL
            AND lower(c.txid_range) IS NOT NULL
          ) acl
          ON acl.column_name = a.attname
        WHERE
          a.attrelid = ($2 || '.' || $1)::regclass
          AND a.attname <> 'audit_id'
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND acl.column_name IS NULL
          ORDER BY a.attnum
      )
      RETURNING id
    )
	SELECT array_agg(id) INTO column_ids FROM added_columns;

    -- log add column event
    IF column_ids IS NOT NULL AND array_length(column_ids, 1) > 0 THEN
      PERFORM pgmemento.log_ddl_event(tablename, schemaname, 2, 'ADD COLUMN');
    END IF;

    -- EVENT: Column dropped
    -- update txid_range for removed columns in audit_column_log table
    WITH dropped_columns AS (
      SELECT
        c.id
      FROM
        pgmemento.audit_table_log a
      JOIN
        pgmemento.audit_column_log c
        ON c.audit_table_id = a.id
      LEFT JOIN (
        SELECT
          attname AS column_name,
          $1 AS table_name,
          $2 AS schema_name
        FROM
          pg_attribute
        WHERE
          attrelid = ($2 || '.' || $1)::regclass
        ) col
        ON col.column_name = c.column_name
        AND col.table_name = a.table_name
        AND col.schema_name = a.schema_name
      WHERE
        a.id = tab_id
        AND col.column_name IS NULL
        AND upper(a.txid_range) IS NULL
        AND lower(a.txid_range) IS NOT NULL
        AND upper(c.txid_range) IS NULL
        AND lower(c.txid_range) IS NOT NULL
    )
    UPDATE
      pgmemento.audit_column_log acl
    SET
      txid_range = numrange(lower(acl.txid_range), txid_current(), '[)') 
    FROM
      dropped_columns dc
    WHERE
      acl.id = dc.id;

    -- EVENT: Column altered
    -- update txid_range for updated columns and insert new versions into audit_column_log table
    WITH updated_columns AS (
      SELECT
        acl.id, acl.audit_table_id, col.column_name,
        col.ordinal_position, col.data_type, col.column_default, col.not_null
      FROM (
        SELECT
          a.attname AS column_name,
          a.attnum AS ordinal_position,
          substr(
            format_type(a.atttypid, a.atttypmod),
            position('.' IN format_type(a.atttypid, a.atttypmod))+1,
            length(format_type(a.atttypid, a.atttypmod))
          ) AS data_type,
          d.adsrc AS column_default,
          a.attnotnull AS not_null,
          $1 AS table_name,
          $2 AS schema_name
        FROM
          pg_attribute a
        LEFT JOIN
          pg_attrdef d
          ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
        WHERE
          a.attrelid = ($2 || '.' || $1)::regclass
          AND a.attnum > 0
          AND NOT a.attisdropped
      ) col
      JOIN (
        SELECT
          c.*,
          a.table_name,
          a.schema_name
        FROM
          pgmemento.audit_column_log c
        JOIN
          pgmemento.audit_table_log a
          ON a.id = c.audit_table_id
        WHERE
          a.id = tab_id
          AND upper(a.txid_range) IS NULL
          AND lower(a.txid_range) IS NOT NULL
          AND upper(c.txid_range) IS NULL
          AND lower(c.txid_range) IS NOT NULL
        ) acl
        ON col.column_name = acl.column_name
        AND col.table_name = acl.table_name
        AND col.schema_name = acl.schema_name
      WHERE (
        col.column_default <> acl.column_default
        OR col.not_null <> acl.not_null
        OR col.data_type <> acl.data_type
      )
    ), insert_new_versions AS (
      INSERT INTO pgmemento.audit_column_log
        (id, audit_table_id, column_name, ordinal_position, data_type, column_default, not_null, txid_range)
      (
        SELECT
          nextval('pgmemento.audit_column_log_id_seq') AS id,
          audit_table_id,
          column_name, 
          ordinal_position,
          data_type,
          column_default,
          not_null,
          numrange(txid_current(), NULL, '[)') AS txid_range
        FROM
          updated_columns
      )
    )
    UPDATE
      pgmemento.audit_column_log acl
    SET
      txid_range = numrange(lower(acl.txid_range), txid_current(), '[)') 
    FROM
      updated_columns uc
    WHERE
      uc.id = acl.id;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.modify_ddl_log_tables(tablename text, schemaname text) OWNER TO ubuntu;

--
-- Name: move_schema_state(text, text, text[], integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION move_schema_state(target_schema_name text, source_schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[], copy_data integer DEFAULT 1) RETURNS SETOF void
    LANGUAGE plpgsql
    AS $_$
DECLARE
  seq VARCHAR(30);
  seq_value INTEGER;
BEGIN
  -- create new schema
  EXECUTE format('CREATE SCHEMA %I', $1);

  -- copy or move sequences
  FOR seq IN 
    SELECT
      c.relname
    FROM
      pg_class c,
      pg_namespace n
    WHERE
      c.relnamespace = n.oid
      AND n.nspname = $2
      AND relkind = 'S'
  LOOP
    IF $4 <> 0 THEN
      SELECT nextval($2 || '.' || seq) INTO seq_value;
      IF seq_value > 1 THEN
        seq_value = seq_value - 1;
      END IF;
      EXECUTE format(
        'CREATE SEQUENCE %I.%I START ' || seq_value,
        $1, seq);
    ELSE
      EXECUTE format(
        'ALTER SEQUENCE %I.%I SET SCHEMA %I',
        $2, seq, $1);
    END IF;
  END LOOP;

  -- copy or move tables
  PERFORM
    pgmemento.move_table_state(c.relname, $1, n.nspname, $4)
  FROM
    pg_class c,
    pg_namespace n
  WHERE
    c.relnamespace = n.oid
    AND n.nspname = $2
    AND c.relkind = 'r'
    AND c.relname <> ALL (COALESCE($3,'{}')); 
 
  -- remove old schema if data were not copied but moved
  IF $4 = 0 THEN
    EXECUTE format(
      'DROP SCHEMA %I CASCADE',
      $2);
  END IF;
END
$_$;


ALTER FUNCTION pgmemento.move_schema_state(target_schema_name text, source_schema_name text, except_tables text[], copy_data integer) OWNER TO ubuntu;

--
-- Name: move_table_state(text, text, text, integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION move_table_state(table_name text, target_schema_name text, source_schema_name text, copy_data integer DEFAULT 1) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
BEGIN
  IF $4 <> 0 THEN
    EXECUTE format(
      'CREATE TABLE %I.%I AS SELECT * FROM %I.%I',
      $2, $1, $3, $1);
  ELSE
    EXECUTE format(
      'ALTER TABLE %I.%I SET SCHEMA %I',
      $3, $1, $2);
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.move_table_state(table_name text, target_schema_name text, source_schema_name text, copy_data integer) OWNER TO ubuntu;

--
-- Name: pkey_schema_state(text, text, text[]); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION pkey_schema_state(target_schema_name text, original_schema_name text DEFAULT 'public'::text, except_tables text[] DEFAULT '{}'::text[]) RETURNS SETOF void
    LANGUAGE sql
    AS $_$
SELECT
  pgmemento.pkey_table_state(c.relname, $1, n.nspname)
FROM
  pg_class c,
  pg_namespace n
WHERE
  c.relnamespace = n.oid
  AND n.nspname = $2
  AND c.relkind = 'r'
  AND c.relname <> ALL (COALESCE($3,'{}')); 
$_$;


ALTER FUNCTION pgmemento.pkey_schema_state(target_schema_name text, original_schema_name text, except_tables text[]) OWNER TO ubuntu;

--
-- Name: pkey_table_state(text, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION pkey_table_state(table_name text, target_schema_name text, original_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  pkey_columns TEXT := '';
BEGIN
  -- rebuild primary key columns to index produced tables
  SELECT
    string_agg(pga.attname,', ') INTO pkey_columns
  FROM
    pg_index pgi,
    pg_class pgc,
    pg_attribute pga 
  WHERE
    pgc.oid = ($3 || '.' || $1)::regclass 
    AND pgi.indrelid = pgc.oid 
    AND pga.attrelid = pgc.oid 
    AND pga.attnum = ANY(pgi.indkey)
    AND pgi.indisprimary;

  IF pkey_columns IS NULL THEN
    RAISE NOTICE 'Table ''%'' has no primary key defined. Column ''audit_id'' will be used as primary key.', $1;
    pkey_columns := 'audit_id';
  END IF;

  EXECUTE format(
    'ALTER TABLE %I.%I ADD PRIMARY KEY (' || pkey_columns || ')',
    $2, $1, $1);
END;
$_$;


ALTER FUNCTION pgmemento.pkey_table_state(table_name text, target_schema_name text, original_schema_name text) OWNER TO ubuntu;

--
-- Name: recover_audit_version(bigint, bigint, jsonb, integer, text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION recover_audit_version(tid bigint, aid bigint, changes jsonb, table_op integer, table_name text, schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql
    AS $_$
DECLARE
  stmt TEXT;
BEGIN
  CASE
  -- CREATE TABLE case
  WHEN $4 = 1 THEN
    -- try to drop table
    BEGIN
      EXECUTE format('DROP TABLE %I.%I', $6, $5);

      EXCEPTION
        WHEN undefined_table THEN
          RAISE NOTICE 'Could not revert CREATE TABLE event for table %.%: %', $6, $5, SQLERRM;
    END;

  -- ADD COLUMN case
  WHEN $4 = 2 THEN
    -- collect added columns
    SELECT
      string_agg(
        'DROP COLUMN '
        || c.column_name,
        ', ' ORDER BY c.id DESC
      ) INTO stmt
    FROM
      pgmemento.audit_column_log c
    JOIN
      pgmemento.audit_table_log t
      ON c.audit_table_id = t.id
    WHERE
      lower(c.txid_range) = $1
      AND upper(c.txid_range) IS NULL
      AND lower(c.txid_range) IS NOT NULL
      AND t.table_name = $5
      AND t.schema_name = $6;

    BEGIN
      -- try to execute ALTER TABLE command
      IF stmt IS NOT NULL THEN
        EXECUTE format('ALTER TABLE %I.%I ' || stmt , $6, $5);
      END IF;

      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Could not revert ADD COLUMN event for table %.%: %', $6, $5, SQLERRM;
    END;

  -- INSERT case
  WHEN $4 = 3 THEN
    -- aid can be null in case of conflicts during insert
    IF $2 IS NOT NULL THEN
      -- delete inserted row
      BEGIN
        EXECUTE format(
          'DELETE FROM %I.%I WHERE audit_id = $1',
          $6, $5)
          USING $2;

        -- row is already deleted
        EXCEPTION
          WHEN no_data_found THEN
            NULL;
      END;
    END IF;

  -- UPDATE case
  WHEN $4 = 4 THEN
    -- update the row with values from changes
    IF $2 IS NOT NULL AND $3 <> '{}'::jsonb THEN
      -- create SET part
      SELECT
        string_agg(key || '=' || quote_nullable(value),', ') INTO stmt
      FROM
        jsonb_each_text($3);

      BEGIN
        -- try to execute UPDATE command
        EXECUTE format(
          'UPDATE %I.%I t SET ' || stmt || ' WHERE t.audit_id = $1',
          $6, $5)
          USING $2;

        -- row is already deleted
        EXCEPTION
          WHEN others THEN
            RAISE NOTICE 'Could not revert UPDATE event for table %.%: %', $6, $5, SQLERRM;
      END;
    END IF;

  -- ALTER COLUMN case
  WHEN $4 = 5 THEN
    -- collect information of altered columns
    SELECT
      string_agg(
        'ALTER COLUMN '
        || c_new.column_name
        || ' SET DATA TYPE '
        || c_old.data_type
        || ' USING '
        || c_new.column_name
        || '::'
        || c_old.data_type,
        ', ' ORDER BY c_new.id
      ) INTO stmt
    FROM
      pgmemento.audit_column_log c_old,
      pgmemento.audit_column_log c_new,
      pgmemento.audit_table_log t
    WHERE
      c_old.audit_table_id = t.id
      AND c_new.audit_table_id = t.id
      AND t.table_name = $5
      AND t.schema_name = $6
      AND upper(c_old.txid_range) = $1
      AND lower(c_new.txid_range) = $1
      AND upper(c_new.txid_range) IS NULL
      AND c_old.ordinal_position = c_new.ordinal_position
      AND c_old.data_type <> c_new.data_type;

    -- alter table if it has not been done, yet
    IF stmt IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I.%I ' || stmt , $6, $5);
    END IF;

    -- fill in data with an UPDATE statement if audit_id is set
    IF $2 IS NOT NULL THEN
      PERFORM pgmemento.recover_audit_version($1, $2, $3, 4, $5, $6);
    END IF;

  -- DROP COLUMN case
  WHEN $4 = 6 THEN
    -- collect information of dropped columns
    SELECT
      string_agg(
        'ADD COLUMN '
        || c_old.column_name
        || ' '
        || c_old.data_type
        || CASE WHEN c_old.column_default IS NOT NULL THEN ' DEFAULT ' || c_old.column_default ELSE '' END 
        || CASE WHEN c_old.not_null THEN ' NOT NULL' ELSE '' END,
        ', ' ORDER BY c_old.id
      ) INTO stmt
    FROM
      pgmemento.audit_table_log t
    JOIN
      pgmemento.audit_column_log c_old
      ON c_old.audit_table_id = t.id
    LEFT JOIN LATERAL (
      SELECT
        c.column_name
      FROM
        pgmemento.audit_table_log atl
      JOIN
        pgmemento.audit_column_log c
        ON c.audit_table_id = atl.id
      WHERE
        atl.table_name = t.table_name
        AND atl.schema_name = t.schema_name
        AND upper(c.txid_range) IS NULL
        AND lower(c.txid_range) IS NOT NULL
      ) c_new
      ON c_old.column_name = c_new.column_name
    WHERE
      upper(c_old.txid_range) = $1
      AND c_new.column_name IS NULL
      AND t.table_name = $5
      AND t.schema_name = $6;
	  
    BEGIN
      -- try to execute ALTER TABLE command
      IF stmt IS NOT NULL THEN
        EXECUTE format('ALTER TABLE %I.%I ' || stmt , $6, $5);
      END IF;

      -- fill in data with an UPDATE statement if audit_id is set
      IF $2 IS NOT NULL THEN
        PERFORM pgmemento.recover_audit_version($1, $2, $3, 4, $5, $6);
      END IF;

      EXCEPTION
        WHEN duplicate_column THEN
          -- if column already exist just do an UPDATE
          PERFORM pgmemento.recover_audit_version($1, $2, $3, 4, $5, $6);
	END;

  -- DELETE or TRUNCATE case
  WHEN $4 = 7 OR $4 = 8 THEN
    IF $2 IS NOT NULL THEN
      BEGIN
        EXECUTE format(
          'INSERT INTO %I.%I SELECT * FROM jsonb_populate_record(null::%I.%I, $1)',
          $6, $5, $6, $5)
          USING $3;

        -- row has already been re-inserted, so update it based on the values of this deleted version
        EXCEPTION
          WHEN unique_violation THEN
            -- merge changes with recent version of table record and update row
            PERFORM pgmemento.recover_audit_version($1, $2, $3, 4, $5, $6);
      END;
    END IF;

  -- DROP TABLE case
  WHEN $4 = 9 THEN
    -- collect information of columns of dropped table
    SELECT
      string_agg(
        c_old.column_name
        || ' '
        || c_old.data_type
        || CASE WHEN c_old.column_default IS NOT NULL THEN ' DEFAULT ' || c_old.column_default ELSE '' END
        || CASE WHEN c_old.not_null THEN ' NOT NULL' ELSE '' END,
        ', ' ORDER BY c_old.ordinal_position
      ) INTO stmt
    FROM
      pgmemento.audit_table_log t
    JOIN
      pgmemento.audit_column_log c_old
      ON c_old.audit_table_id = t.id
    LEFT JOIN LATERAL (
      SELECT
        atl.table_name
      FROM
        pgmemento.audit_table_log atl
      WHERE
        atl.table_name = t.table_name
        AND atl.schema_name = t.schema_name
        AND upper(atl.txid_range) IS NULL
        AND lower(atl.txid_range) IS NOT NULL
      ) t_new
      ON t.table_name = t_new.table_name
    WHERE
      upper(c_old.txid_range) = $1
      AND c_old.column_name <> 'audit_id'
      AND t_new.table_name IS NULL
      AND t.table_name = $5
      AND t.schema_name = $6;

    -- try to create table
    IF stmt IS NOT NULL THEN
      EXECUTE format('CREATE TABLE IF NOT EXISTS %I.%I (' || stmt || ')', $6, $5);
    END IF;

    -- fill in truncated data with an INSERT statement if audit_id is set
    IF $2 IS NOT NULL THEN
      PERFORM pgmemento.recover_audit_version($1, $2, $3, 8, $5, $6);
    END IF;

  END CASE;
END;
$_$;


ALTER FUNCTION pgmemento.recover_audit_version(tid bigint, aid bigint, changes jsonb, table_op integer, table_name text, schema_name text) OWNER TO ubuntu;

--
-- Name: register_audit_table(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION register_audit_table(audit_table_name text, audit_schema_name text DEFAULT 'public'::text) RETURNS integer
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  tab_id INTEGER;
BEGIN
  -- first check if table is audited
  IF NOT EXISTS (
    SELECT
      1
    FROM
      pgmemento.audit_tables
    WHERE
      tablename = $1
      AND schemaname = $2
  ) THEN
    RETURN NULL;
  ELSE
    -- check if affected table exists in 'audit_table_log' (with open range)
    SELECT
      id INTO tab_id
    FROM
      pgmemento.audit_table_log 
    WHERE
      table_name = $1
      AND schema_name = $2
      AND upper(txid_range) IS NULL
      AND lower(txid_range) IS NOT NULL;

    IF tab_id IS NULL THEN
      -- check if table exists in 'audit_table_log' with another name (and open range)
      -- if so, unregister first before making new inserts
      PERFORM
        pgmemento.unregister_audit_table(table_name, schema_name)
      FROM
        pgmemento.audit_table_log 
      WHERE
        relid = ($2 || '.' || $1)::regclass::oid
        AND upper(txid_range) IS NULL
        AND lower(txid_range) IS NOT NULL;

      -- now register table and corresponding columns in audit tables
      INSERT INTO pgmemento.audit_table_log
        (relid, schema_name, table_name, txid_range)
      VALUES 
        (($2 || '.' || $1)::regclass::oid, $2, $1, numrange(txid_current(), NULL, '[)'))
      RETURNING id INTO tab_id;

      -- insert columns of new audited table into 'audit_column_log'
      INSERT INTO pgmemento.audit_column_log 
        (id, audit_table_id, column_name, ordinal_position, column_default, not_null, data_type, txid_range)
      (
        SELECT 
          nextval('pgmemento.audit_column_log_id_seq') AS id,
          tab_id AS audit_table_id,
          a.attname AS column_name,
          a.attnum AS ordinal_position,
          d.adsrc AS column_default,
          a.attnotnull AS not_null,
          substr(
            format_type(a.atttypid, a.atttypmod),
            position('.' IN format_type(a.atttypid, a.atttypmod))+1,
            length(format_type(a.atttypid, a.atttypmod))
          ) AS data_type,
          numrange(txid_current(), NULL, '[)') AS txid_range
        FROM
          pg_attribute a
        LEFT JOIN
          pg_attrdef d
          ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
        WHERE
          a.attrelid = ($2 || '.' || $1)::regclass
          AND a.attname <> 'audit_id'
          AND a.attnum > 0
          AND NOT a.attisdropped
          ORDER BY a.attnum
      );
    END IF;
  END IF;

  RETURN tab_id;
END;
$_$;


ALTER FUNCTION pgmemento.register_audit_table(audit_table_name text, audit_schema_name text) OWNER TO ubuntu;

--
-- Name: restore_query(bigint, bigint, text, text, bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION restore_query(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text, aid bigint DEFAULT NULL::bigint) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
DECLARE
  tab_oid OID;
  tab_id INTEGER;
  tab_name TEXT;
  tab_schema TEXT;
  new_tab_id INTEGER;
  new_tab_name TEXT;
  new_tab_schema TEXT;
  new_tab_upper_txid NUMERIC;
  query_text TEXT;
  log_column RECORD;
  v_columns TEXT := '';
  v_columns_count NUMERIC := 0;
  delimiter VARCHAR(1) := '';
  new_column_name TEXT;
  find_logs TEXT := '';
  join_recent_state BOOLEAN := FALSE;
BEGIN
  -- set variables
  SELECT
    log_tab_oid, log_tab_name, log_tab_schema, log_tab_id, recent_tab_name, recent_tab_schema, recent_tab_id, recent_tab_upper_txid
  INTO
    tab_oid, tab_name, tab_schema, tab_id, new_tab_name, new_tab_schema, new_tab_id, new_tab_upper_txid
  FROM
    pgmemento.audit_table_check($2,$3,$4);

  -- start building the SQL command
  query_text := 'SELECT jsonb_build_object(';

  -- loop over all columns and query the historic value for each column separately
  FOR log_column IN
    SELECT * FROM (  
      SELECT
        column_name,
        ordinal_position,
        data_type
      FROM
        pgmemento.audit_column_log 
      WHERE
        audit_table_id = tab_id
        AND txid_range @> $2::numeric
      ORDER BY
        ordinal_position
    ) c
    UNION ALL
      SELECT
        'audit_id'::text,
        NULL,
        'bigint'::text
  LOOP
    new_column_name := NULL;

    -- columns to be fed into jsonb_build_object function (requires alternating order of keys and values)
    v_columns_count := v_columns_count + 1;
    query_text := query_text 
      || delimiter || E'\n'
      || '  q.key' || v_columns_count || E',\n' 
      || '  q.value' || v_columns_count
      -- use ->>0 to extract first element from jsonb logs
      || '->>0';

    -- extend subquery string to retrieve historic values
    find_logs := find_logs
      || delimiter || E'\n'
      -- key: use historic name
      || format('    %L::text AS key', log_column.column_name) || v_columns_count || E',\n'
      -- value: query logs with given key
      || E'    COALESCE(\n'
      || format(E'      jsonb_agg(a.changes -> %L) FILTER (WHERE a.changes ? %L) OVER (ROWS BETWEEN CURRENT ROW AND CURRENT ROW),\n',
           log_column.column_name, log_column.column_name
         );

    -- if column is not found in the row_log table, recent state has to be queried if table exists
    -- additionally, check if column still exists (not necessary for audit_id column)
    IF log_column.column_name = 'audit_id' THEN
      new_column_name := 'audit_id';
    ELSE
      SELECT
        column_name INTO new_column_name
      FROM
        pgmemento.audit_column_log
      WHERE
        audit_table_id = new_tab_id
        AND ordinal_position = log_column.ordinal_position
        AND data_type = log_column.data_type
        AND upper(txid_range) IS NULL
        AND lower(txid_range) IS NOT NULL;
    END IF;

    IF new_tab_upper_txid IS NOT NULL OR new_column_name IS NULL THEN
      -- there is either no existing table or column
      IF tab_name <> new_tab_name THEN
        RAISE NOTICE 'No matching field found for column ''%'' in active table ''%.%'' (formerly known as ''%.%'').',
                        log_column.column_name, new_tab_schema, new_tab_name, tab_schema, tab_name;
      ELSE
        RAISE NOTICE 'No matching field found for column ''%'' in active table ''%.%''.',
                        log_column.column_name, new_tab_schema, new_tab_name;
      END IF;
    ELSE
      -- take current value from matching column (and hope that the data is really fitting)
      find_logs := find_logs 
        || format(E'      to_jsonb(x.%I),\n', new_column_name);
      join_recent_state := TRUE;
    END IF;

    -- if nothing is found in the logs or in the recent state value will be NULL
    find_logs := find_logs
      || E'      NULL\n';

    -- complete the substring for given column
    find_logs := find_logs
      || '    ) AS value' || v_columns_count;
    delimiter := ',';
  END LOOP;

  -- finish restore query
  query_text := query_text
    -- complete SELECT part
    || E'\n  ) AS log_entry\n'
    -- add FROM block q that extracts the correct jsonb values
    || E'FROM (\n'
    -- use DISTINCT ON to get only one row
    || '  SELECT DISTINCT ON (a.audit_id'
    || CASE WHEN join_recent_state THEN
         ', x.audit_id'
       ELSE
         ''
       END
    || ')'
    -- add column selection that has been set up above 
    || find_logs
    -- add subquery f to get last event for given audit_id before given transaction
    || E'\n  FROM (\n'
    || E'    SELECT DISTINCT ON (r.audit_id) r.audit_id, r.event_id, e.op_id\n'
    || E'      FROM pgmemento.row_log r\n'
    || E'      JOIN pgmemento.table_event_log e ON e.id = r.event_id\n'
    || E'      JOIN pgmemento.transaction_log t ON t.txid = e.transaction_id\n'
    || format(E'        WHERE t.txid >= %L AND t.txid < %L\n', $1, $2)
    || CASE WHEN $5 IS NULL THEN
         format(E'          AND e.table_relid = %L\n', tab_oid)
       ELSE
         format(E'          AND r.audit_id = %L\n', $5)
       END
    || E'        ORDER BY r.audit_id, e.id DESC\n'
    || E'  ) f\n'
    -- left join on row_log table and consider only events younger than the one extracted in subquery f
    || E'  LEFT JOIN pgmemento.row_log a ON a.audit_id = f.audit_id AND a.event_id > f.event_id\n'
    -- left join on actual table to get the recent value for a field if nothing is found in the logs
    || CASE WHEN join_recent_state THEN
         format(E'  LEFT JOIN %I.%I x ON x.audit_id = f.audit_id\n', new_tab_schema, new_tab_name)
       ELSE
         ''
       END
    -- do not produce a result if row with audit_id did not exist before given transaction
    -- could be if filtered event has been either DELETE, TRUNCATE or DROP TABLE
    || E'    WHERE f.op_id < 7\n'
    -- order by oldest log entry for given audit_id
    || '    ORDER BY a.audit_id, '
    || CASE WHEN join_recent_state THEN
         'x.audit_id,'
       ELSE
         ''
       END
    || E' a.id\n'
    -- closing FROM block q
    || E') q\n';

  RETURN query_text;
END;
$_$;


ALTER FUNCTION pgmemento.restore_query(start_from_tid bigint, end_at_tid bigint, table_name text, schema_name text, aid bigint) OWNER TO ubuntu;

--
-- Name: restore_schema_state(bigint, bigint, text, text, text, integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION restore_schema_state(start_from_tid bigint, end_at_tid bigint, original_schema_name text, target_schema_name text, target_table_type text DEFAULT 'VIEW'::text, update_state integer DEFAULT 0) RETURNS SETOF void
    LANGUAGE sql STRICT
    AS $_$
SELECT
  pgmemento.restore_table_state($1,$2,table_name,schema_name,$4,$5,$6)
FROM
  pgmemento.audit_table_log 
WHERE
  schema_name = $3
  AND txid_range @> $2::numeric;
$_$;


ALTER FUNCTION pgmemento.restore_schema_state(start_from_tid bigint, end_at_tid bigint, original_schema_name text, target_schema_name text, target_table_type text, update_state integer) OWNER TO ubuntu;

--
-- Name: restore_table_state(bigint, bigint, text, text, text, text, integer); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION restore_table_state(start_from_tid bigint, end_at_tid bigint, original_table_name text, original_schema_name text, target_schema_name text, target_table_type text DEFAULT 'VIEW'::text, update_state integer DEFAULT 0) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  replace_view TEXT := '';
  tab_oid OID;
  tab_id INTEGER;
  tab_name TEXT;
  tab_schema TEXT;
  new_tab_id INTEGER;
  new_tab_name TEXT;
  new_tab_schema TEXT;
  template_name TEXT;
  restore_query TEXT;
BEGIN
  -- test if target schema already exist
  IF NOT EXISTS (
    SELECT
      1
    FROM
      pg_namespace
    WHERE
      nspname = $5
  ) THEN
    EXECUTE format('CREATE SCHEMA %I', $5);
  END IF;

  -- test if table or view already exist in target schema
  IF EXISTS (
    SELECT
      1
    FROM
      pg_class c,
      pg_namespace n
    WHERE
      c.relnamespace = n.oid
      AND c.relname = $3
      AND n.nspname = $5
      AND (
        c.relkind = 'r'
        OR c.relkind = 'v'
      )
  ) THEN
    IF $7 = 1 THEN
      IF $6 = 'TABLE' THEN
        -- drop the table state
        PERFORM pgmemento.drop_table_state($3, $5);
      ELSE
        replace_view := 'OR REPLACE ';
      END IF;
    ELSE
      RAISE EXCEPTION 'Entity ''%'' in schema ''%'' does already exist. Either delete the table or choose another name or target schema.',
                         $3, $5;
    END IF;
  END IF;

  -- set variables
  SELECT
    log_tab_oid, log_tab_name, log_tab_schema, log_tab_id, recent_tab_name, recent_tab_schema
  INTO
    tab_oid, tab_name, tab_schema, tab_id, new_tab_name, new_tab_schema
  FROM
    pgmemento.audit_table_check($2,$3,$4);

  -- create a temporary table used as template for jsonb_populate_record
  template_name := $3 || '_tmp' || trunc(random() * 99999 + 1);
  PERFORM pgmemento.create_restore_template($2, template_name, tab_name, tab_schema, CASE WHEN $6 = 'TABLE' THEN 0 ELSE 1 END);

  -- check if logging entries exist in the audit_log table
  IF EXISTS (
    SELECT
      1
    FROM
      pgmemento.table_event_log 
    WHERE
      table_relid = tab_oid
    LIMIT 1
  ) THEN
    -- let's go back in time - restore a table state for given transaction interval
    IF upper($6) = 'VIEW' OR upper($6) = 'TABLE' THEN
      restore_query := 'CREATE ' 
        || replace_view || $6 
        || format(E' %I.%I AS\n', $5, tab_name)
        -- select all rows from result of jsonb_populate_record function
        || E'  SELECT p.*\n'
        -- use generate_log_entries function to produce JSONB tuples
        || format(E'    FROM pgmemento.generate_log_entries(%L,%L,%L,%L) AS log_entry\n', $1, $2, $3, $4)
        -- pass reconstructed tuples to jsonb_populate_record function
        || E'    JOIN LATERAL (\n'
        || format(E'      SELECT * FROM jsonb_populate_record(null::%I, log_entry)\n', template_name)
        || '    ) p ON (true)';

      -- finally execute query string
      EXECUTE restore_query;
    ELSE
      RAISE NOTICE 'Table type ''%'' not supported. Use ''VIEW'' or ''TABLE''.', $6;
    END IF;
  ELSE
    -- no entries found in log table - table is regarded empty
    IF tab_name <> new_tab_name THEN
      RAISE NOTICE 'Did not found entries in log table for table ''%.%'' (formerly known as ''%.%'').',
                      new_tab_schema, new_tab_name, tab_schema, tab_name;
    ELSE
      RAISE NOTICE 'Did not found entries in log table for table ''%.%''.',
                      new_tab_schema, new_tab_name;
    END IF;
    IF upper($6) = 'TABLE' THEN
      EXECUTE format('CREATE TABLE %I.%I AS SELECT * FROM %I', $5, tab_name, template_name);
    ELSIF upper($6) = 'VIEW' THEN
      EXECUTE format('CREATE ' || replace_view || 'VIEW %I.%I AS SELECT * FROM %I.%I LIMIT 0', $5, tab_name, $4, new_tab_name);        
    ELSE
      RAISE NOTICE 'Table type ''%'' not supported. Use ''VIEW'' or ''TABLE''.', $6;
    END IF;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.restore_table_state(start_from_tid bigint, end_at_tid bigint, original_table_name text, original_schema_name text, target_schema_name text, target_table_type text, update_state integer) OWNER TO ubuntu;

--
-- Name: revert_distinct_transaction(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION revert_distinct_transaction(tid bigint) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT
      $1 AS txid,
      q.audit_id,
      CASE WHEN e1.op_id = 4 AND e2.op_id > 6 THEN 3 ELSE e1.op_id END AS op_id,
      q.changes, 
      a.table_name,
      a.schema_name,
      rank() OVER (PARTITION BY e1.id ORDER BY q.row_log_id DESC) AS audit_order,
      CASE WHEN e1.op_id > 4 THEN
        rank() OVER (ORDER BY d.depth ASC)
      ELSE
        rank() OVER (ORDER BY d.depth DESC)
      END AS dependency_order
    FROM (
      SELECT
        r.audit_id,
        e.table_relid,
        min(e.id) AS first_event,
        max(e.id) AS last_event,
        min(r.id) AS row_log_id,
        pgmemento.jsonb_merge(r.changes ORDER BY r.id DESC) AS changes
      FROM
        pgmemento.table_event_log e
      LEFT JOIN
        pgmemento.row_log r
        ON r.event_id = e.id
      WHERE
        e.transaction_id = $1
      GROUP BY
        r.audit_id,
        e.table_relid
    ) q
    JOIN
      pgmemento.table_event_log e1
      ON e1.id = q.first_event
    JOIN
      pgmemento.table_event_log e2
      ON e2.id = q.last_event
    JOIN
      pgmemento.audit_table_log a
      ON a.relid = q.table_relid
    LEFT JOIN pgmemento.audit_tables_dependency d
      ON d.tablename = a.table_name
      AND d.schemaname = a.schema_name
    WHERE
      NOT (
        e1.op_id = 1
        AND e2.op_id = 9
      )
      AND NOT (
        e1.op_id = 3
        AND e2.op_id > 6
      )
    ORDER BY
      dependency_order,
      e1.id DESC,
      audit_order
  LOOP
    PERFORM pgmemento.recover_audit_version(rec.txid, rec.audit_id, rec.changes, rec.op_id, rec.table_name, rec.schema_name);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.revert_distinct_transaction(tid bigint) OWNER TO ubuntu;

--
-- Name: revert_distinct_transactions(bigint, bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION revert_distinct_transactions(start_from_tid bigint, end_at_tid bigint) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT
      q.txid,
      q.audit_id,
      CASE WHEN e1.op_id = 4 AND e2.op_id > 6 THEN 3 ELSE e1.op_id END AS op_id,
      q.changes, 
      a.table_name,
      a.schema_name,
      rank() OVER (PARTITION BY e1.id ORDER BY q.row_log_id DESC) AS audit_order,
      CASE WHEN e1.op_id > 4 THEN
        rank() OVER (ORDER BY d.depth ASC)
      ELSE
        rank() OVER (ORDER BY d.depth DESC)
      END AS dependency_order
    FROM (
      SELECT
        r.audit_id,
        e.table_relid,
        min(e.transaction_id) AS txid,
        min(e.id) AS first_event,
        max(e.id) AS last_event,
        min(r.id) AS row_log_id,
        pgmemento.jsonb_merge(r.changes ORDER BY r.id DESC) AS changes
      FROM
        pgmemento.table_event_log e
      LEFT JOIN
        pgmemento.row_log r
        ON r.event_id = e.id
      WHERE
        e.transaction_id BETWEEN $1 AND $2
      GROUP BY
        r.audit_id,
        e.table_relid
    ) q
    JOIN
      pgmemento.table_event_log e1
      ON e1.id = q.first_event
    JOIN
      pgmemento.table_event_log e2
      ON e2.id = q.last_event
    JOIN
      pgmemento.audit_table_log a
      ON a.relid = q.table_relid
    LEFT JOIN pgmemento.audit_tables_dependency d
      ON d.tablename = a.table_name
      AND d.schemaname = a.schema_name
    WHERE
      NOT (
        e1.op_id = 1
        AND e2.op_id = 9
      )
      AND NOT (
        e1.op_id = 3
        AND e2.op_id > 6
      )
    ORDER BY
      dependency_order,
      e1.id DESC,
      audit_order
  LOOP
    PERFORM pgmemento.recover_audit_version(rec.txid, rec.audit_id, rec.changes, rec.op_id, rec.table_name, rec.schema_name);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.revert_distinct_transactions(start_from_tid bigint, end_at_tid bigint) OWNER TO ubuntu;

--
-- Name: revert_transaction(bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION revert_transaction(tid bigint) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      t.txid,
      r.audit_id, 
      r.changes,
      e.op_id, 
      a.table_name,
      a.schema_name,
      rank() OVER (PARTITION BY r.event_id ORDER BY r.id DESC) AS audit_order,
      CASE WHEN e.op_id > 4 THEN
        rank() OVER (ORDER BY d.depth ASC)
      ELSE
        rank() OVER (ORDER BY d.depth DESC)
      END AS dependency_order
    FROM 
      pgmemento.transaction_log t 
    JOIN
      pgmemento.table_event_log e
      ON e.transaction_id = t.txid
    JOIN
      pgmemento.audit_table_log a 
      ON a.relid = e.table_relid
    LEFT JOIN
      pgmemento.audit_tables_dependency d
      ON d.tablename = a.table_name
     AND d.schemaname = a.schema_name
    LEFT JOIN
      pgmemento.row_log r
      ON r.event_id = e.id
    WHERE
      t.txid = $1
    ORDER BY
      dependency_order,
      e.id DESC,
      audit_order
  LOOP
    PERFORM pgmemento.recover_audit_version(rec.txid, rec.audit_id, rec.changes, rec.op_id, rec.table_name, rec.schema_name);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.revert_transaction(tid bigint) OWNER TO ubuntu;

--
-- Name: revert_transactions(bigint, bigint); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION revert_transactions(start_from_tid bigint, end_at_tid bigint) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      t.txid,
      r.audit_id, 
      r.changes,
      e.op_id,
      a.table_name,
      a.schema_name,
      rank() OVER (PARTITION BY r.event_id ORDER BY r.id DESC) AS audit_order,
      CASE WHEN e.op_id > 4 THEN
        rank() OVER (ORDER BY d.depth ASC)
      ELSE
        rank() OVER (ORDER BY d.depth DESC)
      END AS dependency_order
    FROM
      pgmemento.transaction_log t 
    JOIN
      pgmemento.table_event_log e
      ON e.transaction_id = t.txid
    JOIN
      pgmemento.audit_table_log a 
      ON a.relid = e.table_relid
    LEFT JOIN
      pgmemento.audit_tables_dependency d
      ON d.tablename = a.table_name
     AND d.schemaname = a.schema_name
    LEFT JOIN
      pgmemento.row_log r
      ON r.event_id = e.id
    WHERE
      t.txid BETWEEN $1 AND $2
    ORDER BY
      t.id DESC,
      dependency_order,
      e.id DESC,
      audit_order
  LOOP
    PERFORM pgmemento.recover_audit_version(rec.txid, rec.audit_id, rec.changes, rec.op_id, rec.table_name, rec.schema_name);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.revert_transactions(start_from_tid bigint, end_at_tid bigint) OWNER TO ubuntu;

--
-- Name: schema_drop_pre_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION schema_drop_pre_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  ddl_text TEXT := current_query();
  stack TEXT;
  schema_name TEXT;
  rec RECORD;
  e_id INTEGER;
BEGIN
  -- get context in which trigger has been fired
  GET DIAGNOSTICS stack = PG_CONTEXT;
  stack := pgmemento.get_ddl_from_context(stack);

  -- if DDL command was found in context, trigger was fired from inside a function
  IF stack IS NOT NULL THEN
    ddl_text := stack;
  END IF;

  -- lowercase everything
  ddl_text := lower(ddl_text);

  -- check if input string contains comments
  IF ddl_text LIKE '%--%'
  OR ddl_text LIKE '%/*%'
  OR ddl_text LIKE '%*/%' THEN
    RAISE EXCEPTION 'Query contains comments. Unable to log event properly. Please, remove them. Query: %', ddl_text;
  END IF;

  -- extracting the schema name from the DDL command
  -- remove irrelevant parts and line breaks from the DDL string
  schema_name := replace(lower(ddl_text), 'drop schema ', '');
  schema_name := replace(schema_name, 'if exists ', '');
  schema_name := replace(schema_name, ' cascade', '');
  schema_name := replace(schema_name, ' restrict', '');
  schema_name := replace(schema_name, ';', '');
  schema_name := regexp_replace(schema_name, '[\r\n]+', ' ', 'g');
  schema_name := substring(schema_name, '\S(?:.*\S)*');

  -- truncate tables to log the data
  FOR rec IN 
    SELECT
      n.nspname AS schemaname,
      c.relname AS tablename 
    FROM
      pg_class c
    JOIN
      pg_namespace n
      ON n.oid = c.relnamespace
    JOIN
      pgmemento.audit_tables_dependency d
      ON d.schemaname = n.nspname
      AND d.tablename = c.relname
    WHERE
      n.nspname = schema_name
    ORDER BY
      n.oid,
      d.depth DESC
  LOOP
    -- log the whole content of the dropped table as truncated
    e_id :=  pgmemento.log_ddl_event(rec.tablename, rec.schemaname, 8, 'TRUNCATE');

    EXECUTE format(
      'INSERT INTO pgmemento.row_log (event_id, audit_id, changes)
         SELECT $1, audit_id, to_jsonb(%I) AS content FROM %I.%I ORDER BY audit_id',
         rec.tablename, rec.schemaname, rec.tablename) USING e_id;

    -- now log drop table event
    PERFORM pgmemento.log_ddl_event(rec.tablename, rec.schemaname, 9, 'DROP TABLE');

    -- unregister table from log tables
    PERFORM pgmemento.unregister_audit_table(rec.tablename, rec.schemaname);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.schema_drop_pre_trigger() OWNER TO ubuntu;

--
-- Name: sequence_schema_state(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION sequence_schema_state(target_schema_name text, original_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  seq TEXT;
  seq_value INTEGER;
BEGIN
  -- copy or move sequences
  FOR seq IN
    SELECT
      c.relname
    FROM
      pg_class c,
      pg_namespace n
    WHERE
      c.relnamespace = n.oid
      AND n.nspname = $2
      AND relkind = 'S'
  LOOP
    SELECT nextval($2 || '.' || seq) INTO seq_value;
    IF seq_value > 1 THEN
      seq_value = seq_value - 1;
    END IF;
    EXECUTE format(
      'CREATE SEQUENCE %I.%I START ' || seq_value,
      $1, seq);
  END LOOP;
END;
$_$;


ALTER FUNCTION pgmemento.sequence_schema_state(target_schema_name text, original_schema_name text) OWNER TO ubuntu;

--
-- Name: table_alter_post_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION table_alter_post_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN 
    SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    PERFORM pgmemento.modify_ddl_log_tables(split_part(obj.object_identity, '.' ,2), obj.schema_name);
  END LOOP;
END;
$$;


ALTER FUNCTION pgmemento.table_alter_post_trigger() OWNER TO ubuntu;

--
-- Name: table_alter_pre_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION table_alter_pre_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  ddl_text TEXT := current_query();
  stack TEXT;
  altering BOOLEAN := FALSE;
  dropping BOOLEAN := FALSE;
  do_next BOOLEAN := TRUE;
  table_ident TEXT := '';
  schemaname TEXT;
  tablename TEXT;
  ntables INTEGER := 0;
  objs TEXT[];
  columnname TEXT;
  e_id INTEGER;
BEGIN
  -- get context in which trigger has been fired
  GET DIAGNOSTICS stack = PG_CONTEXT;
  stack := pgmemento.get_ddl_from_context(stack);

  -- if DDL command was found in context, trigger was fired from inside a function
  IF stack IS NOT NULL THEN
    ddl_text := stack;
  END IF;

  -- lowercase everything
  ddl_text := lower(ddl_text);

  -- are columns renamed, altered or dropped
  altering := ddl_text LIKE '%using%' AND NOT ddl_text LIKE '%using index%';
  dropping := ddl_text LIKE '%drop column%' OR ddl_text LIKE '%drop %';

  IF altering OR dropping THEN
    -- check if input string contains comments
    IF ddl_text LIKE '%--%'
    OR ddl_text LIKE '%/*%'
    OR ddl_text LIKE '%*/%' THEN
      RAISE EXCEPTION 'Query contains comments. Unable to log event properly. Please, remove them. Query: %', ddl_text;
    END IF;

    -- extracting the table identifier from the DDL command
    -- remove irrelevant parts and line breaks from the DDL string
    ddl_text := replace(ddl_text, 'alter table ', '');
    ddl_text := replace(ddl_text, 'if exists ', '');
    ddl_text := replace(ddl_text, ' cascade', '');
    ddl_text := replace(ddl_text, ' restrict', '');
    ddl_text := replace(ddl_text, ';', '');
    ddl_text := regexp_replace(ddl_text, '[\r\n]+', ' ', 'g');

    FOR i IN 1..length(ddl_text) LOOP
      EXIT WHEN do_next = FALSE;
      IF substr(ddl_text,i,1) <> ' ' OR position('"' IN table_ident) = 1 THEN
        table_ident := table_ident || substr(ddl_text,i,1);
      ELSE
        IF length(table_ident) > 0 THEN
          do_next := FALSE;
        END IF;
      END IF;
    END LOOP;
	
    -- get table and schema name
    IF table_ident LIKE '%.%' THEN
      -- check if table is audited
      SELECT
        table_name,
        schema_name
      INTO
        tablename,
        schemaname
      FROM
        pgmemento.audit_table_log
      WHERE
        table_name = split_part(table_ident, '.', 2)
        AND schema_name = split_part(table_ident, '.', 1)
        AND upper(txid_range) IS NULL
        AND lower(txid_range) IS NOT NULL;

      IF schemaname IS NOT NULL AND tablename IS NOT NULL THEN
        ntables := 1;
      END IF;
    ELSE
      tablename := table_ident;

      -- check if table is audited and not ambiguous
      FOR schemaname IN
        SELECT
          schema_name
        FROM
          pgmemento.audit_table_log
        WHERE
          table_name = tablename
          AND upper(txid_range) IS NULL
          AND lower(txid_range) IS NOT NULL
      LOOP
        ntables := ntables + 1;
      END LOOP;
    END IF;

    -- table not found in audit_table_log, so it can be altered without logging
    IF ntables IS NULL OR ntables = 0 THEN
      RETURN;
    END IF;

    IF ntables > 1 THEN
      -- table name is found more than once in audit_table_log
      RAISE EXCEPTION 'Please specify the schema name in the ALTER TABLE command.';
    END IF;

    -- remove schema and table name from DDL string and try to process columns
    ddl_text := replace(ddl_text, schemaname || '.', '');
    ddl_text := replace(ddl_text, tablename, '');
    objs := regexp_split_to_array(ddl_text, E'\\s+');

    -- set 'do_next' to FALSE because first element in objs will not be the column name
    do_next := FALSE;

    FOREACH columnname IN ARRAY objs LOOP
      columnname := replace(columnname, ',', '');
      columnname := substring(columnname, '\S(?:.*\S)*');
      IF do_next THEN
        IF columnname <> 'column' THEN
          IF EXISTS (
            SELECT
              1
            FROM
              pgmemento.audit_column_log c,
              pgmemento.audit_table_log a
            WHERE
              c.audit_table_id = a.id
              AND c.column_name = columnname
              AND a.table_name = tablename
              AND a.schema_name = schemaname
              AND upper(c.txid_range) IS NULL
              AND lower(c.txid_range) IS NOT NULL
          ) THEN
            -- try to log corresponding table event
            IF altering THEN
              e_id := pgmemento.log_ddl_event(tablename, schemaname, 5, 'ALTER COLUMN');
            ELSE
              e_id := pgmemento.log_ddl_event(tablename, schemaname, 6, 'DROP COLUMN');
            END IF;

            -- log data of entire column
            EXECUTE format(
              'INSERT INTO pgmemento.row_log(event_id, audit_id, changes)
                 SELECT $1, t.audit_id, jsonb_build_object($2,t.%I) AS content FROM %I.%I t',
                 columnname, schemaname, tablename) USING e_id, columnname;
          END IF;

          -- done with the column, but there might be more to come
          do_next := FALSE;
        END IF;
      END IF;

      -- is the column name next?
      IF columnname = 'alter'
      OR columnname = 'drop' THEN
        do_next := TRUE;
      ELSIF columnname = 'set' 
      OR columnname = 'collate'
      OR columnname = 'using' THEN
        do_next := FALSE;
      END IF;
    END LOOP;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.table_alter_pre_trigger() OWNER TO ubuntu;

--
-- Name: table_create_post_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION table_create_post_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN 
    SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF obj.object_type = 'table' AND obj.schema_name NOT LIKE 'pg_temp%' THEN
      -- log create table event
      PERFORM pgmemento.log_ddl_event(split_part(obj.object_identity, '.' ,2), obj.schema_name, 1, 'CREATE TABLE');

      -- start auditing for new table
      PERFORM pgmemento.create_table_audit(split_part(obj.object_identity, '.' ,2), obj.schema_name, 0);
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION pgmemento.table_create_post_trigger() OWNER TO ubuntu;

--
-- Name: table_drop_post_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION table_drop_post_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj RECORD;
  tab_id INTEGER;
BEGIN
  FOR obj IN 
    SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type = 'table' AND NOT obj.is_temporary THEN
      -- update txid_range for removed table in audit_table_log table
      PERFORM pgmemento.unregister_audit_table(obj.object_name, obj.schema_name);
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION pgmemento.table_drop_post_trigger() OWNER TO ubuntu;

--
-- Name: table_drop_pre_trigger(); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION table_drop_pre_trigger() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  ddl_text TEXT := current_query();
  stack TEXT;
  schemaname TEXT;
  tablename TEXT;
  ntables INTEGER := 0;
  e_id INTEGER;
BEGIN
  -- get context in which trigger has been fired
  GET DIAGNOSTICS stack = PG_CONTEXT;
  stack := pgmemento.get_ddl_from_context(stack);

  -- if DDL command was found in context, trigger was fired from inside a function
  IF stack IS NOT NULL THEN
    ddl_text := stack;
  END IF;

  -- lowercase everything
  ddl_text := lower(ddl_text);

  -- check if input string contains comments
  IF ddl_text LIKE '%--%'
  OR ddl_text LIKE '%/*%'
  OR ddl_text LIKE '%*/%' THEN
    RAISE EXCEPTION 'Query contains comments. Unable to log event properly. Please, remove them. Query: %', ddl_text;
  END IF;

  -- extracting the table identifier from the DDL command
  -- remove irrelevant parts and line breaks from the DDL string
  ddl_text := replace(ddl_text, 'drop table ', '');
  ddl_text := replace(ddl_text, 'if exists ', '');
  ddl_text := replace(ddl_text, ' cascade', '');
  ddl_text := replace(ddl_text, ' restrict', '');
  ddl_text := replace(ddl_text, ';', '');
  ddl_text := regexp_replace(ddl_text, '[\r\n]+', ' ', 'g');
  ddl_text := substring(ddl_text, '\S(?:.*\S)*');

  -- get table and schema name
  IF ddl_text LIKE '%.%' THEN
    -- check if table is audited
    SELECT
      table_name,
      schema_name
    INTO
      tablename,
      schemaname
    FROM
      pgmemento.audit_table_log
    WHERE
      table_name = split_part(ddl_text, '.', 2)
      AND schema_name = split_part(ddl_text, '.', 1)
      AND upper(txid_range) IS NULL
      AND lower(txid_range) IS NOT NULL;

    IF schemaname IS NOT NULL AND tablename IS NOT NULL THEN
      ntables := 1;
    END IF;
  ELSE
    tablename := ddl_text;

    -- check if table is audited and not ambiguous
    FOR schemaname IN
      SELECT
        schema_name
      FROM
        pgmemento.audit_table_log
      WHERE
        table_name = tablename
        AND upper(txid_range) IS NULL
        AND lower(txid_range) IS NOT NULL
    LOOP
      ntables := ntables + 1;
    END LOOP;
  END IF;

  -- table not found in audit_table_log, so it can be dropped
  IF ntables IS NULL OR ntables = 0 THEN
    RETURN;
  END IF;

  IF ntables > 1 THEN
    -- table name is found more than once in audit_table_log
    RAISE EXCEPTION 'Please specify the schema name in the DROP TABLE command.';
  ELSE
    -- log the whole content of the dropped table as truncated
    e_id :=  pgmemento.log_ddl_event(tablename, schemaname, 8, 'TRUNCATE');

    EXECUTE format(
      'INSERT INTO pgmemento.row_log (event_id, audit_id, changes)
         SELECT $1, audit_id, to_jsonb(%I) AS content FROM %I.%I ORDER BY audit_id',
         tablename, schemaname, tablename) USING e_id;

    -- now log drop table event
    PERFORM pgmemento.log_ddl_event(tablename, schemaname, 9, 'DROP TABLE');
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.table_drop_pre_trigger() OWNER TO ubuntu;

--
-- Name: unregister_audit_table(text, text); Type: FUNCTION; Schema: pgmemento; Owner: ubuntu
--

CREATE FUNCTION unregister_audit_table(audit_table_name text, audit_schema_name text DEFAULT 'public'::text) RETURNS SETOF void
    LANGUAGE plpgsql STRICT
    AS $_$
DECLARE
  tab_id INTEGER;
BEGIN
  -- update txid_range for removed table in audit_table_log table
  UPDATE
    pgmemento.audit_table_log
  SET
    txid_range = numrange(lower(txid_range), txid_current(), '[)') 
  WHERE
    table_name = $1
    AND schema_name = $2
    AND upper(txid_range) IS NULL
    AND lower(txid_range) IS NOT NULL
  RETURNING
    id INTO tab_id;

  IF tab_id IS NOT NULL THEN
    -- update txid_range for removed columns in audit_column_log table
    UPDATE
      pgmemento.audit_column_log
    SET
      txid_range = numrange(lower(txid_range), txid_current(), '[)') 
    WHERE
      audit_table_id = tab_id
      AND upper(txid_range) IS NULL
      AND lower(txid_range) IS NOT NULL;
  END IF;
END;
$_$;


ALTER FUNCTION pgmemento.unregister_audit_table(audit_table_name text, audit_schema_name text) OWNER TO ubuntu;

--
-- Name: jsonb_merge(jsonb); Type: AGGREGATE; Schema: pgmemento; Owner: ubuntu
--

CREATE AGGREGATE jsonb_merge(jsonb) (
    SFUNC = jsonb_concat,
    STYPE = jsonb,
    INITCOND = '{}'
);


ALTER AGGREGATE pgmemento.jsonb_merge(jsonb) OWNER TO ubuntu;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: audit_column_log; Type: TABLE; Schema: pgmemento; Owner: ubuntu
--

CREATE TABLE audit_column_log (
    id integer NOT NULL,
    audit_table_id integer NOT NULL,
    column_name text NOT NULL,
    ordinal_position integer,
    data_type text,
    column_default text,
    not_null boolean,
    txid_range numrange
);


ALTER TABLE audit_column_log OWNER TO ubuntu;

--
-- Name: audit_column_log_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE audit_column_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE audit_column_log_id_seq OWNER TO ubuntu;

--
-- Name: audit_column_log_id_seq; Type: SEQUENCE OWNED BY; Schema: pgmemento; Owner: ubuntu
--

ALTER SEQUENCE audit_column_log_id_seq OWNED BY audit_column_log.id;


--
-- Name: audit_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE audit_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE audit_id_seq OWNER TO ubuntu;

--
-- Name: audit_table_log; Type: TABLE; Schema: pgmemento; Owner: ubuntu
--

CREATE TABLE audit_table_log (
    id integer NOT NULL,
    relid oid,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    txid_range numrange
);


ALTER TABLE audit_table_log OWNER TO ubuntu;

--
-- Name: audit_table_log_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE audit_table_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE audit_table_log_id_seq OWNER TO ubuntu;

--
-- Name: audit_table_log_id_seq; Type: SEQUENCE OWNED BY; Schema: pgmemento; Owner: ubuntu
--

ALTER SEQUENCE audit_table_log_id_seq OWNED BY audit_table_log.id;


--
-- Name: audit_tables; Type: VIEW; Schema: pgmemento; Owner: ubuntu
--

CREATE VIEW audit_tables AS
 SELECT n.nspname AS schemaname,
    c.relname AS tablename,
    b.txid_min,
    b.txid_max,
        CASE
            WHEN ((tg.tgenabled IS NOT NULL) AND (tg.tgenabled <> 'D'::"char")) THEN true
            ELSE false
        END AS tg_is_active
   FROM ((((pg_class c
     JOIN pg_namespace n ON ((c.relnamespace = n.oid)))
     JOIN pg_attribute a ON ((a.attrelid = c.oid)))
     JOIN LATERAL ( SELECT get_txid_bounds_to_table.txid_min,
            get_txid_bounds_to_table.txid_max
           FROM get_txid_bounds_to_table((c.relname)::text, (n.nspname)::text) get_txid_bounds_to_table(txid_min, txid_max)) b ON (true))
     LEFT JOIN ( SELECT pg_trigger.tgrelid,
            pg_trigger.tgenabled
           FROM pg_trigger
          WHERE (pg_trigger.tgname = 'log_transaction_trigger'::name)) tg ON ((c.oid = tg.tgrelid)))
  WHERE ((n.nspname <> 'pgmemento'::name) AND (n.nspname !~~ 'pg_temp%'::text) AND (a.attname = 'audit_id'::name) AND (c.relkind = 'r'::"char"))
  ORDER BY n.nspname, c.relname;


ALTER TABLE audit_tables OWNER TO ubuntu;

--
-- Name: audit_tables_dependency; Type: VIEW; Schema: pgmemento; Owner: ubuntu
--

CREATE VIEW audit_tables_dependency AS
 WITH RECURSIVE table_dependency(parent_oid, child_oid, table_name, schema_name, depth) AS (
         SELECT DISTINCT ON (c.conrelid) c.confrelid AS parent_oid,
            c.conrelid AS child_oid,
            a.table_name,
            n.nspname AS schema_name,
            1 AS depth
           FROM ((pg_constraint c
             JOIN pg_namespace n ON ((n.oid = c.connamespace)))
             JOIN audit_table_log a ON (((a.relid = c.conrelid) AND (a.schema_name = (n.nspname)::text))))
          WHERE ((c.contype = 'f'::"char") AND (c.conrelid <> c.confrelid) AND (upper(a.txid_range) IS NULL) AND (lower(a.txid_range) IS NOT NULL))
        UNION ALL
         SELECT DISTINCT ON (c.conrelid) c.confrelid AS parent_oid,
            c.conrelid AS child_oid,
            a.table_name,
            n.nspname AS schema_name,
            (d.depth + 1) AS depth
           FROM (((pg_constraint c
             JOIN pg_namespace n ON ((n.oid = c.connamespace)))
             JOIN audit_table_log a ON (((a.relid = c.conrelid) AND (a.schema_name = (n.nspname)::text))))
             JOIN table_dependency d ON ((d.child_oid = c.confrelid)))
          WHERE ((c.contype = 'f'::"char") AND (d.child_oid <> c.conrelid) AND (upper(a.txid_range) IS NULL) AND (lower(a.txid_range) IS NOT NULL))
        )
 SELECT td.schema_name AS schemaname,
    td.table_name AS tablename,
    td.depth
   FROM ( SELECT table_dependency.schema_name,
            table_dependency.table_name,
            max(table_dependency.depth) AS depth
           FROM table_dependency
          GROUP BY table_dependency.schema_name, table_dependency.table_name
        UNION ALL
         SELECT atl.schema_name,
            atl.table_name,
            0 AS depth
           FROM (audit_table_log atl
             LEFT JOIN table_dependency d ON ((d.child_oid = atl.relid)))
          WHERE (d.child_oid IS NULL)) td
  ORDER BY td.schema_name, td.depth, td.table_name;


ALTER TABLE audit_tables_dependency OWNER TO ubuntu;

--
-- Name: row_log; Type: TABLE; Schema: pgmemento; Owner: ubuntu
--

CREATE TABLE row_log (
    id bigint NOT NULL,
    event_id integer NOT NULL,
    audit_id bigint NOT NULL,
    changes jsonb
);


ALTER TABLE row_log OWNER TO ubuntu;

--
-- Name: row_log_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE row_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE row_log_id_seq OWNER TO ubuntu;

--
-- Name: row_log_id_seq; Type: SEQUENCE OWNED BY; Schema: pgmemento; Owner: ubuntu
--

ALTER SEQUENCE row_log_id_seq OWNED BY row_log.id;


--
-- Name: table_event_log; Type: TABLE; Schema: pgmemento; Owner: ubuntu
--

CREATE TABLE table_event_log (
    id integer NOT NULL,
    transaction_id bigint NOT NULL,
    op_id smallint NOT NULL,
    table_operation character varying(12),
    table_relid oid NOT NULL
);


ALTER TABLE table_event_log OWNER TO ubuntu;

--
-- Name: table_event_log_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE table_event_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE table_event_log_id_seq OWNER TO ubuntu;

--
-- Name: table_event_log_id_seq; Type: SEQUENCE OWNED BY; Schema: pgmemento; Owner: ubuntu
--

ALTER SEQUENCE table_event_log_id_seq OWNED BY table_event_log.id;


--
-- Name: transaction_log; Type: TABLE; Schema: pgmemento; Owner: ubuntu
--

CREATE TABLE transaction_log (
    id integer NOT NULL,
    txid bigint NOT NULL,
    stmt_date timestamp with time zone NOT NULL,
    user_name text,
    client_name text
);


ALTER TABLE transaction_log OWNER TO ubuntu;

--
-- Name: transaction_log_id_seq; Type: SEQUENCE; Schema: pgmemento; Owner: ubuntu
--

CREATE SEQUENCE transaction_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transaction_log_id_seq OWNER TO ubuntu;

--
-- Name: transaction_log_id_seq; Type: SEQUENCE OWNED BY; Schema: pgmemento; Owner: ubuntu
--

ALTER SEQUENCE transaction_log_id_seq OWNED BY transaction_log.id;


SET search_path = public, pg_catalog;

--
-- Name: barrier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE barrier (
    gid integer NOT NULL,
    agency integer,
    regions character varying(30),
    ecosystem character varying(30),
    gps_date date,
    barr_code character varying(20),
    barr_actio character varying(10),
    barr_type character varying(25),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    barr_miles numeric,
    barr_km numeric,
    previously character varying(10),
    gps_photo character varying(3),
    photo_azim integer,
    qa_qc character varying(10),
    shape_leng numeric,
    geom geometry(MultiLineString,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE barrier OWNER TO postgres;

--
-- Name: barrier_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE barrier_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE barrier_gid_seq OWNER TO postgres;

--
-- Name: barrier_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE barrier_gid_seq OWNED BY barrier.gid;


--
-- Name: barrier_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE barrier_sub (
    gid integer NOT NULL,
    agency integer,
    regions character varying(30),
    ecosystem character varying(30),
    gps_date date,
    barr_code character varying(20),
    barr_actio character varying(10),
    barr_type character varying(25),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    barr_miles numeric,
    barr_km numeric,
    previously character varying(10),
    gps_photo character varying(3),
    photo_azim integer,
    qa_qc character varying(10),
    shape_stle numeric,
    shape_leng numeric,
    geom geometry(MultiLineString,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE barrier_sub OWNER TO postgres;

--
-- Name: barrier_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE barrier_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE barrier_sub_gid_seq OWNER TO postgres;

--
-- Name: barrier_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE barrier_sub_gid_seq OWNED BY barrier_sub.gid;


--
-- Name: blm_regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE blm_regions (
    gid integer NOT NULL,
    objectid numeric(10,0),
    area_ numeric,
    perimeter numeric,
    ha750_2003 numeric,
    ha750_2004 numeric,
    hyd_area character varying(4),
    hyd_area_n character varying(30),
    subarea_na character varying(30),
    hyd_region numeric,
    hyd_regi_1 character varying(30),
    pltsym numeric,
    desig character varying(1),
    des_reas character varying(6),
    scale numeric,
    desig_orde character varying(10),
    shape_leng numeric,
    ird numeric(10,0),
    ird_name character varying(50),
    shape_le_1 numeric,
    shape_le_2 numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE blm_regions OWNER TO postgres;

--
-- Name: blm_regions_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE blm_regions_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE blm_regions_gid_seq OWNER TO postgres;

--
-- Name: blm_regions_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE blm_regions_gid_seq OWNED BY blm_regions.gid;


--
-- Name: dist_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_line (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    dist_use character varying(25),
    use_freq character varying(3),
    use_recent character varying(3),
    site_stabi character varying(10),
    dist_crust character varying(25),
    undist_cru character varying(25),
    depth character varying(20),
    width character varying(20),
    type character varying(15),
    plant_dama character varying(40),
    accessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    miles_dist numeric,
    km_dist numeric,
    treated character varying(3),
    dist_sever numeric(10,0),
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    soil_vulne character varying(20),
    photo_azim numeric(10,0),
    qa_qc character varying(10),
    old_dist_c character varying(100),
    shape_leng numeric,
    geom geometry(MultiLineString),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_line OWNER TO postgres;

--
-- Name: dist_line_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_line_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_line_gid_seq OWNER TO postgres;

--
-- Name: dist_line_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_line_gid_seq OWNED BY dist_line.gid;


--
-- Name: dist_line_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_line_sub (
    gid integer NOT NULL,
    agency integer,
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    dist_use character varying(25),
    use_freq character varying(3),
    use_recent character varying(3),
    site_stabi character varying(10),
    dist_crust character varying(25),
    undist_cru character varying(25),
    depth character varying(20),
    width character varying(20),
    type character varying(15),
    plant_dama character varying(40),
    accessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    miles_dist numeric,
    km_dist numeric,
    treated character varying(3),
    dist_sever integer,
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    soil_vulne character varying(20),
    photo_azim integer,
    qa_qc character varying(10),
    old_dist_c character varying(100),
    shape_stle numeric,
    shape_leng numeric,
    geom geometry(MultiLineString,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_line_sub OWNER TO postgres;

--
-- Name: dist_line_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_line_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_line_sub_gid_seq OWNER TO postgres;

--
-- Name: dist_line_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_line_sub_gid_seq OWNED BY dist_line_sub.gid;


--
-- Name: dist_point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_point (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    use_freq character varying(3),
    use_recent character varying(3),
    dist_pt_ty character varying(25),
    accessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    previously character varying(3),
    project_na character varying(25),
    estimate_s numeric(10,0),
    treated character varying(3),
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    soil_vulne character varying(20),
    dist_use character varying(25),
    photo_azim numeric(10,0),
    qa_qc character varying(10),
    old_distco character varying(50),
    geom geometry(Point),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_point OWNER TO postgres;

--
-- Name: dist_point_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_point_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_point_gid_seq OWNER TO postgres;

--
-- Name: dist_point_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_point_gid_seq OWNED BY dist_point.gid;


--
-- Name: dist_point_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_point_sub (
    gid integer NOT NULL,
    agency integer,
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    use_freq character varying(3),
    use_recent character varying(3),
    dist_pt_ty character varying(25),
    accessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    previously character varying(3),
    project_na character varying(25),
    estimate_s numeric(10,0),
    treated character varying(3),
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    soil_vulne character varying(20),
    dist_use character varying(25),
    photo_azim integer,
    qa_qc character varying(10),
    old_distco character varying(50),
    geom geometry(Point,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_point_sub OWNER TO postgres;

--
-- Name: dist_point_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_point_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_point_sub_gid_seq OWNER TO postgres;

--
-- Name: dist_point_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_point_sub_gid_seq OWNED BY dist_point_sub.gid;


--
-- Name: dist_poly_centroid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_poly_centroid (
    gid integer NOT NULL,
    agency numeric(10,0),
    regions character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    dist_use character varying(25),
    use_freq character varying(3),
    use_recent character varying(3),
    site_stabi character varying(10),
    dist_crust character varying(25),
    undist_cru character varying(25),
    depth character varying(20),
    dist_poly_ character varying(30),
    plant_dama character varying(40),
    assessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    acres_rest numeric,
    kmsq_resto numeric,
    treated character varying(3),
    dist_sever numeric(10,0),
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    site_vulne character varying(20),
    photo_azim numeric(10,0),
    qa_qc character varying(10),
    old_distco character varying(50),
    orig_fid numeric(10,0),
    geom geometry(Point),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_poly_centroid OWNER TO postgres;

--
-- Name: dist_poly_centroid_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_poly_centroid_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_poly_centroid_gid_seq OWNER TO postgres;

--
-- Name: dist_poly_centroid_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_poly_centroid_gid_seq OWNED BY dist_poly_centroid.gid;


--
-- Name: dist_polygon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_polygon (
    gid integer NOT NULL,
    agency numeric(10,0),
    regions character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    dist_use character varying(25),
    use_freq character varying(3),
    use_recent character varying(3),
    site_stabi character varying(10),
    dist_crust character varying(25),
    undist_cru character varying(25),
    depth character varying(20),
    dist_poly_ character varying(30),
    plant_dama character varying(40),
    assessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    acres_rest numeric,
    kmsq_resto numeric,
    treated character varying(3),
    dist_sever numeric(10,0),
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    site_vulne character varying(20),
    photo_azim numeric(10,0),
    qa_qc character varying(10),
    old_distco character varying(50),
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_polygon OWNER TO postgres;

--
-- Name: dist_polygon_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_polygon_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_polygon_gid_seq OWNER TO postgres;

--
-- Name: dist_polygon_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_polygon_gid_seq OWNED BY dist_polygon.gid;


--
-- Name: dist_polygon_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE dist_polygon_sub (
    gid integer NOT NULL,
    agency integer,
    regions character varying(30),
    ecosystem character varying(30),
    gps_date date,
    dist_code character varying(20),
    dist_use character varying(25),
    use_freq character varying(3),
    use_recent character varying(3),
    site_stabi character varying(10),
    dist_crust character varying(25),
    undist_cru character varying(25),
    depth character varying(20),
    dist_poly_ character varying(30),
    plant_dama character varying(40),
    assessibil character varying(10),
    visibility character varying(10),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    acres_rest numeric,
    kmsq_resto numeric,
    treated character varying(3),
    dist_sever integer,
    cultural character varying(3),
    t_e_specie character varying(3),
    gps_photo character varying(3),
    site_vulne character varying(20),
    photo_azim integer,
    qa_qc character varying(10),
    old_distco character varying(50),
    shape_star numeric,
    shape_stle numeric,
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE dist_polygon_sub OWNER TO postgres;

--
-- Name: dist_polygon_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dist_polygon_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dist_polygon_sub_gid_seq OWNER TO postgres;

--
-- Name: dist_polygon_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dist_polygon_sub_gid_seq OWNED BY dist_polygon_sub.gid;


--
-- Name: fs_regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE fs_regions (
    gid integer NOT NULL,
    objectid numeric(10,0),
    region character varying(50),
    area_acres numeric,
    code character varying(5),
    shape_leng numeric,
    shape_le_1 numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE fs_regions OWNER TO postgres;

--
-- Name: fs_regions_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fs_regions_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fs_regions_gid_seq OWNER TO postgres;

--
-- Name: fs_regions_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fs_regions_gid_seq OWNED BY fs_regions.gid;


--
-- Name: mdep_boundary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE mdep_boundary (
    gid integer NOT NULL,
    sde_sde_bo numeric,
    perimeter numeric,
    bndpmoj_ numeric,
    bndpmoj_id numeric,
    inside numeric,
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE mdep_boundary OWNER TO postgres;

--
-- Name: mdep_boundary_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE mdep_boundary_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mdep_boundary_gid_seq OWNER TO postgres;

--
-- Name: mdep_boundary_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE mdep_boundary_gid_seq OWNED BY mdep_boundary.gid;


--
-- Name: mdi_boundary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE mdi_boundary (
    gid integer NOT NULL,
    id numeric(10,0),
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE mdi_boundary OWNER TO postgres;

--
-- Name: mdi_boundary_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE mdi_boundary_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mdi_boundary_gid_seq OWNER TO postgres;

--
-- Name: mdi_boundary_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE mdi_boundary_gid_seq OWNED BY mdi_boundary.gid;


--
-- Name: measures_measure_id_seq; Type: SEQUENCE; Schema: public; Owner: ubuntu
--

CREATE SEQUENCE measures_measure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE measures_measure_id_seq OWNER TO ubuntu;

--
-- Name: monitoring_1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE monitoring_1 (
    gid integer NOT NULL,
    agency numeric(10,0),
    primary_ob character varying(25),
    secondary_ character varying(25),
    gps_date date,
    gps_photo character varying(3),
    photo_azim numeric(10,0),
    reuse_disc character varying(3),
    resto_inte character varying(15),
    reveg_succ character varying(15),
    comments character varying(254),
    qa_qc character varying(10),
    geom geometry(Point),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE monitoring_1 OWNER TO postgres;

--
-- Name: monitoring_1_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE monitoring_1_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE monitoring_1_gid_seq OWNER TO postgres;

--
-- Name: monitoring_1_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE monitoring_1_gid_seq OWNED BY monitoring_1.gid;


--
-- Name: nv_counties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE nv_counties (
    gid integer NOT NULL,
    objectid numeric(10,0),
    restoratio numeric,
    perimeter numeric,
    nv_county_ numeric(10,0),
    nv_count_1 numeric(10,0),
    name character varying(20),
    state_name character varying(25),
    state_fips character varying(2),
    cnty_fips character varying(3),
    fips character varying(5),
    pop1990 numeric(10,0),
    pop1999 numeric(10,0),
    pop90_sqmi numeric(10,0),
    households numeric(10,0),
    males numeric(10,0),
    females numeric(10,0),
    white numeric(10,0),
    black numeric(10,0),
    ameri_es numeric(10,0),
    asian_pi numeric(10,0),
    other numeric(10,0),
    hispanic numeric(10,0),
    age_under5 numeric(10,0),
    age_5_17 numeric(10,0),
    age_18_29 numeric(10,0),
    age_30_49 numeric(10,0),
    age_50_64 numeric(10,0),
    age_65_up numeric(10,0),
    nevermarry numeric(10,0),
    married numeric(10,0),
    separated numeric(10,0),
    widowed numeric(10,0),
    divorced numeric(10,0),
    hsehld_1_m numeric(10,0),
    hsehld_1_f numeric(10,0),
    marhh_chd numeric(10,0),
    marhh_no_c numeric(10,0),
    mhh_child numeric(10,0),
    fhh_child numeric(10,0),
    hse_units numeric(10,0),
    vacant numeric(10,0),
    owner_occ numeric(10,0),
    renter_occ numeric(10,0),
    median_val numeric(10,0),
    medianrent numeric(10,0),
    units_1det numeric(10,0),
    units_1att numeric(10,0),
    units2 numeric(10,0),
    units3_9 numeric(10,0),
    units10_49 numeric(10,0),
    units50_up numeric(10,0),
    mobilehome numeric(10,0),
    no_farms87 numeric(10,0),
    avg_size87 numeric(10,0),
    crop_acr87 numeric(10,0),
    avg_sale87 numeric(10,0),
    shape_leng numeric,
    shape_le_1 numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE nv_counties OWNER TO postgres;

--
-- Name: nv_counties_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE nv_counties_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE nv_counties_gid_seq OWNER TO postgres;

--
-- Name: nv_counties_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE nv_counties_gid_seq OWNED BY nv_counties.gid;


--
-- Name: rest_poly_centroid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE rest_poly_centroid (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(50),
    resto_code character varying(20),
    resto_acti character varying(30),
    te_action character varying(3),
    non_list_a character varying(3),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    treatment_ character varying(7),
    acres_rest numeric,
    kmsq_resto numeric,
    gps_date date,
    gps_photo character varying(3),
    photo_azim numeric(10,0),
    signed character varying(5),
    deep_till character varying(5),
    barrier_in character varying(5),
    mulch character varying(11),
    monitoring character varying(3),
    previously character varying(10),
    orig_fid numeric(10,0),
    geom geometry(Point),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE rest_poly_centroid OWNER TO postgres;

--
-- Name: rest_poly_centroid_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE rest_poly_centroid_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE rest_poly_centroid_gid_seq OWNER TO postgres;

--
-- Name: rest_poly_centroid_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE rest_poly_centroid_gid_seq OWNED BY rest_poly_centroid.gid;


--
-- Name: resto_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_line (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    resto_code character varying(25),
    resto_act character varying(50),
    te_act character varying(5),
    nonlists_a character varying(5),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    treatment_ character varying(10),
    signed character varying(5),
    mulch character varying(10),
    deep_till character varying(5),
    barrier_in character varying(5),
    miles_rest numeric,
    km_resto numeric,
    gps_photo character varying(3),
    photo_azim numeric(10,0),
    monitoring character varying(3),
    previously character varying(10),
    qa_qc character varying(10),
    shape_leng numeric,
    geom geometry(MultiLineString),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_line OWNER TO postgres;

--
-- Name: resto_line_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_line_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_line_gid_seq OWNER TO postgres;

--
-- Name: resto_line_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_line_gid_seq OWNED BY resto_line.gid;


--
-- Name: resto_line_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_line_sub (
    gid integer NOT NULL,
    agency integer,
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    resto_code character varying(25),
    resto_act character varying(50),
    te_act character varying(5),
    nonlists_a character varying(5),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    treatment_ character varying(10),
    signed character varying(5),
    mulch character varying(10),
    deep_till character varying(5),
    barrier_in character varying(5),
    miles_rest numeric,
    km_resto numeric,
    gps_photo character varying(3),
    photo_azim integer,
    monitoring character varying(3),
    previously character varying(10),
    qa_qc character varying(10),
    shape_stle numeric,
    shape_leng numeric,
    geom geometry(MultiLineString,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_line_sub OWNER TO postgres;

--
-- Name: resto_line_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_line_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_line_sub_gid_seq OWNER TO postgres;

--
-- Name: resto_line_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_line_sub_gid_seq OWNED BY resto_line_sub.gid;


--
-- Name: resto_point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_point (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    resto_code character varying(20),
    resto_acti character varying(25),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    sqft_resto numeric(10,0),
    gps_photo character varying(3),
    photo_azim numeric(10,0),
    previously character varying(10),
    qa_qc character varying(10),
    geom geometry(Point),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_point OWNER TO postgres;

--
-- Name: resto_point_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_point_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_point_gid_seq OWNER TO postgres;

--
-- Name: resto_point_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_point_gid_seq OWNED BY resto_point.gid;


--
-- Name: resto_point_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_point_sub (
    gid integer NOT NULL,
    agency integer,
    region character varying(30),
    ecosystem character varying(30),
    gps_date date,
    resto_code character varying(20),
    resto_acti character varying(25),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    sqft_resto numeric(10,0),
    gps_photo character varying(3),
    photo_azim integer,
    previously character varying(10),
    qa_qc character varying(10),
    geom geometry(Point,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_point_sub OWNER TO postgres;

--
-- Name: resto_point_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_point_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_point_sub_gid_seq OWNER TO postgres;

--
-- Name: resto_point_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_point_sub_gid_seq OWNED BY resto_point_sub.gid;


--
-- Name: resto_polygon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_polygon (
    gid integer NOT NULL,
    agency numeric(10,0),
    region character varying(30),
    ecosystem character varying(50),
    resto_code character varying(20),
    resto_acti character varying(30),
    te_action character varying(3),
    non_list_a character varying(3),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    treatment_ character varying(7),
    acres_rest numeric,
    kmsq_resto numeric,
    gps_date date,
    gps_photo character varying(3),
    photo_azim numeric(10,0),
    signed character varying(5),
    deep_till character varying(5),
    barrier_in character varying(5),
    mulch character varying(11),
    monitoring character varying(3),
    previously character varying(10),
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_polygon OWNER TO postgres;

--
-- Name: resto_polygon_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_polygon_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_polygon_gid_seq OWNER TO postgres;

--
-- Name: resto_polygon_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_polygon_gid_seq OWNED BY resto_polygon.gid;


--
-- Name: resto_polygon_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resto_polygon_sub (
    gid integer NOT NULL,
    agency integer,
    region character varying(30),
    ecosystem character varying(50),
    resto_code character varying(20),
    resto_acti character varying(30),
    te_action character varying(3),
    non_list_a character varying(3),
    comments character varying(254),
    primary_ob character varying(25),
    secondary_ character varying(25),
    project_na character varying(25),
    treatment_ character varying(7),
    acres_rest numeric,
    kmsq_resto numeric,
    gps_date date,
    gps_photo character varying(3),
    photo_azim integer,
    signed character varying(5),
    deep_till character varying(5),
    barrier_in character varying(5),
    mulch character varying(11),
    monitoring character varying(3),
    previously character varying(10),
    shape_star numeric,
    shape_stle numeric,
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon,4326),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE resto_polygon_sub OWNER TO postgres;

--
-- Name: resto_polygon_sub_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resto_polygon_sub_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resto_polygon_sub_gid_seq OWNER TO postgres;

--
-- Name: resto_polygon_sub_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resto_polygon_sub_gid_seq OWNED BY resto_polygon_sub.gid;


--
-- Name: roads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE roads (
    gid integer NOT NULL,
    route_type character varying(20),
    dominantsu character varying(20),
    route_widt character varying(20),
    name character varying(30),
    comment character varying(30),
    sourcethm character varying(16),
    status character varying(20),
    rd_number character varying(10),
    rs2477_id character varying(9),
    rd_status character varying(10),
    indicator_ numeric,
    length_mi numeric,
    no numeric(10,0),
    gtlf_id numeric(10,0),
    admin_st character varying(2),
    gtlf_plan_ character varying(20),
    famslink character varying(10),
    gtlf_own character varying(20),
    gtlf_nu character varying(10),
    gtlf_nm character varying(40),
    gtlf_nu2 character varying(10),
    gtlf_nm2 character varying(40),
    gtlf_surfa character varying(20),
    gtlf_carto character varying(3),
    noshow_rsn character varying(20),
    use_restri character varying(20),
    fun_class character varying(10),
    spec_dsgtn character varying(4),
    esmtrow character varying(3),
    use_class character varying(20),
    coord_src_ character varying(5),
    coord_src2 character varying(25),
    date_ date,
    miles numeric,
    condition character varying(20),
    use_level character varying(20),
    created_us character varying(254),
    created_da date,
    last_edite character varying(254),
    last_edi_1 date,
    objectid_1 numeric(10,0),
    road_statu character varying(254),
    shape_leng numeric,
    geom geometry(MultiLineStringZM)
);


ALTER TABLE roads OWNER TO postgres;

--
-- Name: roads_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE roads_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE roads_gid_seq OWNER TO postgres;

--
-- Name: roads_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE roads_gid_seq OWNED BY roads.gid;


--
-- Name: snap_extent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE snap_extent (
    gid integer NOT NULL,
    id numeric(10,0),
    shape_leng numeric,
    shape_area numeric,
    geom geometry(MultiPolygon)
);


ALTER TABLE snap_extent OWNER TO postgres;

--
-- Name: snap_extent_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE snap_extent_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE snap_extent_gid_seq OWNER TO postgres;

--
-- Name: snap_extent_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE snap_extent_gid_seq OWNED BY snap_extent.gid;


--
-- Name: soil_vulnerability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE soil_vulnerability (
    gid integer NOT NULL,
    objectid numeric(10,0),
    fid_nevada numeric(10,0),
    fid_neva_1 numeric(10,0),
    restoratio numeric,
    perimeter numeric,
    fmatn character varying(6),
    l_name character varying(50),
    geologicfm character varying(16),
    statemap character varying(16),
    county character varying(50),
    bioagemax numeric(10,0),
    bioagemin numeric(10,0),
    modpoly character varying(50),
    notes character varying(250),
    refs character varying(50),
    reviewed character varying(10),
    shape_leng numeric,
    vulfmatn numeric,
    vulgeologi numeric,
    fid_nvcoun numeric(10,0),
    fid_nvco_1 numeric(10,0),
    area_1 numeric,
    perimete_1 numeric,
    county_nam character varying(32),
    area__sq_m numeric,
    comment character varying(64),
    acres numeric,
    fid_swland numeric(10,0),
    area_12 numeric,
    perimete_2 numeric,
    ca_landow_ numeric(10,0),
    ca_landow1 numeric(10,0),
    region character varying(3),
    owner numeric(10,0),
    source numeric(10,0),
    macode character varying(10),
    status numeric(10,0),
    matype character varying(5),
    owner_name character varying(50),
    new_owner character varying(50),
    name character varying(50),
    state character varying(50),
    fid_surfac numeric(10,0),
    fid_surf_1 numeric(10,0),
    areasymbol character varying(20),
    spatialver numeric,
    musym character varying(6),
    mukey character varying(30),
    mukey_1 character varying(10),
    surftext character varying(254),
    stmergevul numeric,
    fid_nvco_2 numeric(10,0),
    fid_nvco_3 numeric(10,0),
    area_12_13 numeric,
    perimete_3 numeric,
    county_n_1 character varying(32),
    area__sq_1 numeric,
    comment_1 character varying(64),
    acres_1 numeric,
    fid_swla_1 numeric(10,0),
    area_12_14 numeric,
    perimete_4 numeric,
    ca_lando_1 numeric(10,0),
    ca_lando_2 numeric(10,0),
    region_1 character varying(3),
    owner_1 numeric(10,0),
    source_1 numeric(10,0),
    macode_1 character varying(10),
    status_1 numeric(10,0),
    matype_1 character varying(5),
    owner_na_1 character varying(50),
    new_owne_1 character varying(50),
    name_1 character varying(50),
    state_1 character varying(50),
    shape_le_1 numeric,
    shape_le_2 numeric,
    shape_area numeric,
    geom geometry(MultiPolygon),
    audit_id bigint DEFAULT nextval('pgmemento.audit_id_seq'::regclass) NOT NULL
);


ALTER TABLE soil_vulnerability OWNER TO postgres;

--
-- Name: soil_vulnerability_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE soil_vulnerability_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE soil_vulnerability_gid_seq OWNER TO postgres;

--
-- Name: soil_vulnerability_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE soil_vulnerability_gid_seq OWNED BY soil_vulnerability.gid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE users (
    user_name character varying(50) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    password character varying(225) NOT NULL,
    certificate character varying(255),
    agency integer,
    password_reset integer
);


ALTER TABLE users OWNER TO postgres;

SET search_path = pgmemento, pg_catalog;

--
-- Name: audit_column_log id; Type: DEFAULT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY audit_column_log ALTER COLUMN id SET DEFAULT nextval('audit_column_log_id_seq'::regclass);


--
-- Name: audit_table_log id; Type: DEFAULT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY audit_table_log ALTER COLUMN id SET DEFAULT nextval('audit_table_log_id_seq'::regclass);


--
-- Name: row_log id; Type: DEFAULT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY row_log ALTER COLUMN id SET DEFAULT nextval('row_log_id_seq'::regclass);


--
-- Name: table_event_log id; Type: DEFAULT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY table_event_log ALTER COLUMN id SET DEFAULT nextval('table_event_log_id_seq'::regclass);


--
-- Name: transaction_log id; Type: DEFAULT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY transaction_log ALTER COLUMN id SET DEFAULT nextval('transaction_log_id_seq'::regclass);


SET search_path = public, pg_catalog;

--
-- Name: barrier gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier ALTER COLUMN gid SET DEFAULT nextval('barrier_gid_seq'::regclass);


--
-- Name: barrier_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier_sub ALTER COLUMN gid SET DEFAULT nextval('barrier_sub_gid_seq'::regclass);


--
-- Name: blm_regions gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY blm_regions ALTER COLUMN gid SET DEFAULT nextval('blm_regions_gid_seq'::regclass);


--
-- Name: dist_line gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line ALTER COLUMN gid SET DEFAULT nextval('dist_line_gid_seq'::regclass);


--
-- Name: dist_line_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line_sub ALTER COLUMN gid SET DEFAULT nextval('dist_line_sub_gid_seq'::regclass);


--
-- Name: dist_point gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point ALTER COLUMN gid SET DEFAULT nextval('dist_point_gid_seq'::regclass);


--
-- Name: dist_point_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point_sub ALTER COLUMN gid SET DEFAULT nextval('dist_point_sub_gid_seq'::regclass);


--
-- Name: dist_poly_centroid gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_poly_centroid ALTER COLUMN gid SET DEFAULT nextval('dist_poly_centroid_gid_seq'::regclass);


--
-- Name: dist_polygon gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon ALTER COLUMN gid SET DEFAULT nextval('dist_polygon_gid_seq'::regclass);


--
-- Name: dist_polygon_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon_sub ALTER COLUMN gid SET DEFAULT nextval('dist_polygon_sub_gid_seq'::regclass);


--
-- Name: fs_regions gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fs_regions ALTER COLUMN gid SET DEFAULT nextval('fs_regions_gid_seq'::regclass);


--
-- Name: mdep_boundary gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY mdep_boundary ALTER COLUMN gid SET DEFAULT nextval('mdep_boundary_gid_seq'::regclass);


--
-- Name: mdi_boundary gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY mdi_boundary ALTER COLUMN gid SET DEFAULT nextval('mdi_boundary_gid_seq'::regclass);


--
-- Name: monitoring_1 gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY monitoring_1 ALTER COLUMN gid SET DEFAULT nextval('monitoring_1_gid_seq'::regclass);


--
-- Name: nv_counties gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY nv_counties ALTER COLUMN gid SET DEFAULT nextval('nv_counties_gid_seq'::regclass);


--
-- Name: rest_poly_centroid gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY rest_poly_centroid ALTER COLUMN gid SET DEFAULT nextval('rest_poly_centroid_gid_seq'::regclass);


--
-- Name: resto_line gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line ALTER COLUMN gid SET DEFAULT nextval('resto_line_gid_seq'::regclass);


--
-- Name: resto_line_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line_sub ALTER COLUMN gid SET DEFAULT nextval('resto_line_sub_gid_seq'::regclass);


--
-- Name: resto_point gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point ALTER COLUMN gid SET DEFAULT nextval('resto_point_gid_seq'::regclass);


--
-- Name: resto_point_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point_sub ALTER COLUMN gid SET DEFAULT nextval('resto_point_sub_gid_seq'::regclass);


--
-- Name: resto_polygon gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon ALTER COLUMN gid SET DEFAULT nextval('resto_polygon_gid_seq'::regclass);


--
-- Name: resto_polygon_sub gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon_sub ALTER COLUMN gid SET DEFAULT nextval('resto_polygon_sub_gid_seq'::regclass);


--
-- Name: roads gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY roads ALTER COLUMN gid SET DEFAULT nextval('roads_gid_seq'::regclass);


--
-- Name: snap_extent gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY snap_extent ALTER COLUMN gid SET DEFAULT nextval('snap_extent_gid_seq'::regclass);


--
-- Name: soil_vulnerability gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY soil_vulnerability ALTER COLUMN gid SET DEFAULT nextval('soil_vulnerability_gid_seq'::regclass);


SET search_path = pgmemento, pg_catalog;

--
-- Data for Name: audit_column_log; Type: TABLE DATA; Schema: pgmemento; Owner: ubuntu
--

COPY audit_column_log (id, audit_table_id, column_name, ordinal_position, data_type, column_default, not_null, txid_range) FROM stdin;
1	1	srid	1	integer	\N	t	[1038,)
2	1	auth_name	2	character varying(256)	\N	f	[1038,)
3	1	auth_srid	3	integer	\N	f	[1038,)
4	1	srtext	4	character varying(2048)	\N	f	[1038,)
5	1	proj4text	5	character varying(2048)	\N	f	[1038,)
6	2	gid	1	integer	nextval('resto_point_gid_seq'::regclass)	t	[1038,)
7	2	agency	2	numeric(10,0)	\N	f	[1038,)
8	2	region	3	character varying(30)	\N	f	[1038,)
9	2	ecosystem	4	character varying(30)	\N	f	[1038,)
10	2	gps_date	5	date	\N	f	[1038,)
11	2	resto_code	6	character varying(20)	\N	f	[1038,)
12	2	resto_acti	7	character varying(25)	\N	f	[1038,)
13	2	comments	8	character varying(254)	\N	f	[1038,)
14	2	primary_ob	9	character varying(25)	\N	f	[1038,)
15	2	secondary_	10	character varying(25)	\N	f	[1038,)
16	2	project_na	11	character varying(25)	\N	f	[1038,)
17	2	sqft_resto	12	numeric(10,0)	\N	f	[1038,)
18	2	gps_photo	13	character varying(3)	\N	f	[1038,)
19	2	photo_azim	14	numeric(10,0)	\N	f	[1038,)
20	2	previously	15	character varying(10)	\N	f	[1038,)
21	2	qa_qc	16	character varying(10)	\N	f	[1038,)
22	2	geom	17	geometry(Point)	\N	f	[1038,)
23	3	gid	1	integer	nextval('resto_polygon_gid_seq'::regclass)	t	[1038,)
24	3	agency	2	numeric(10,0)	\N	f	[1038,)
25	3	region	3	character varying(30)	\N	f	[1038,)
26	3	ecosystem	4	character varying(50)	\N	f	[1038,)
27	3	resto_code	5	character varying(20)	\N	f	[1038,)
28	3	resto_acti	6	character varying(30)	\N	f	[1038,)
29	3	te_action	7	character varying(3)	\N	f	[1038,)
30	3	non_list_a	8	character varying(3)	\N	f	[1038,)
31	3	comments	9	character varying(254)	\N	f	[1038,)
32	3	primary_ob	10	character varying(25)	\N	f	[1038,)
33	3	secondary_	11	character varying(25)	\N	f	[1038,)
34	3	project_na	12	character varying(25)	\N	f	[1038,)
35	3	treatment_	13	character varying(7)	\N	f	[1038,)
36	3	acres_rest	14	numeric	\N	f	[1038,)
37	3	kmsq_resto	15	numeric	\N	f	[1038,)
38	3	gps_date	16	date	\N	f	[1038,)
39	3	gps_photo	17	character varying(3)	\N	f	[1038,)
40	3	photo_azim	18	numeric(10,0)	\N	f	[1038,)
41	3	signed	19	character varying(5)	\N	f	[1038,)
42	3	deep_till	20	character varying(5)	\N	f	[1038,)
43	3	barrier_in	21	character varying(5)	\N	f	[1038,)
44	3	mulch	22	character varying(11)	\N	f	[1038,)
45	3	monitoring	23	character varying(3)	\N	f	[1038,)
46	3	previously	24	character varying(10)	\N	f	[1038,)
47	3	shape_leng	25	numeric	\N	f	[1038,)
48	3	shape_area	26	numeric	\N	f	[1038,)
49	3	geom	27	geometry(MultiPolygon)	\N	f	[1038,)
50	4	gid	1	integer	\N	t	[1038,)
51	4	agency	2	integer	\N	f	[1038,)
52	4	region	3	character varying(30)	\N	f	[1038,)
53	4	ecosystem	4	character varying(30)	\N	f	[1038,)
54	4	gps_date	5	date	\N	f	[1038,)
55	4	resto_code	6	character varying(20)	\N	f	[1038,)
56	4	resto_acti	7	character varying(25)	\N	f	[1038,)
57	4	comments	8	character varying(254)	\N	f	[1038,)
58	4	primary_ob	9	character varying(25)	\N	f	[1038,)
59	4	secondary_	10	character varying(25)	\N	f	[1038,)
60	4	project_na	11	character varying(25)	\N	f	[1038,)
61	4	sqft_resto	12	numeric(10,0)	\N	f	[1038,)
62	4	gps_photo	13	character varying(3)	\N	f	[1038,)
63	4	photo_azim	14	integer	\N	f	[1038,)
64	4	previously	15	character varying(10)	\N	f	[1038,)
65	4	qa_qc	16	character varying(10)	\N	f	[1038,)
66	4	geom	17	geometry(Point,4326)	\N	f	[1038,)
67	5	gid	1	integer	\N	t	[1038,)
68	5	agency	2	integer	\N	f	[1038,)
69	5	region	3	character varying(30)	\N	f	[1038,)
70	5	ecosystem	4	character varying(50)	\N	f	[1038,)
71	5	resto_code	5	character varying(20)	\N	f	[1038,)
72	5	resto_acti	6	character varying(30)	\N	f	[1038,)
73	5	te_action	7	character varying(3)	\N	f	[1038,)
74	5	non_list_a	8	character varying(3)	\N	f	[1038,)
75	5	comments	9	character varying(254)	\N	f	[1038,)
76	5	primary_ob	10	character varying(25)	\N	f	[1038,)
77	5	secondary_	11	character varying(25)	\N	f	[1038,)
78	5	project_na	12	character varying(25)	\N	f	[1038,)
79	5	treatment_	13	character varying(7)	\N	f	[1038,)
80	5	acres_rest	14	numeric	\N	f	[1038,)
81	5	kmsq_resto	15	numeric	\N	f	[1038,)
82	5	gps_date	16	date	\N	f	[1038,)
83	5	gps_photo	17	character varying(3)	\N	f	[1038,)
84	5	photo_azim	18	integer	\N	f	[1038,)
85	5	signed	19	character varying(5)	\N	f	[1038,)
86	5	deep_till	20	character varying(5)	\N	f	[1038,)
87	5	barrier_in	21	character varying(5)	\N	f	[1038,)
88	5	mulch	22	character varying(11)	\N	f	[1038,)
89	5	monitoring	23	character varying(3)	\N	f	[1038,)
90	5	previously	24	character varying(10)	\N	f	[1038,)
91	5	shape_star	25	numeric	\N	f	[1038,)
92	5	shape_stle	26	numeric	\N	f	[1038,)
93	5	shape_leng	27	numeric	\N	f	[1038,)
94	5	shape_area	28	numeric	\N	f	[1038,)
95	5	geom	29	geometry(MultiPolygon,4326)	\N	f	[1038,)
96	6	gid	1	integer	nextval('barrier_gid_seq'::regclass)	t	[1038,)
97	6	agency	2	integer	\N	f	[1038,)
98	6	regions	3	character varying(30)	\N	f	[1038,)
99	6	ecosystem	4	character varying(30)	\N	f	[1038,)
100	6	gps_date	5	date	\N	f	[1038,)
101	6	barr_code	6	character varying(20)	\N	f	[1038,)
102	6	barr_actio	7	character varying(10)	\N	f	[1038,)
103	6	barr_type	8	character varying(25)	\N	f	[1038,)
104	6	comments	9	character varying(254)	\N	f	[1038,)
105	6	primary_ob	10	character varying(25)	\N	f	[1038,)
106	6	secondary_	11	character varying(25)	\N	f	[1038,)
107	6	project_na	12	character varying(25)	\N	f	[1038,)
108	6	barr_miles	13	numeric	\N	f	[1038,)
109	6	barr_km	14	numeric	\N	f	[1038,)
110	6	previously	15	character varying(10)	\N	f	[1038,)
111	6	gps_photo	16	character varying(3)	\N	f	[1038,)
112	6	photo_azim	17	integer	\N	f	[1038,)
113	6	qa_qc	18	character varying(10)	\N	f	[1038,)
114	6	shape_leng	19	numeric	\N	f	[1038,)
115	6	geom	20	geometry(MultiLineString,4326)	\N	f	[1038,)
116	7	gid	1	integer	\N	t	[1038,)
117	7	agency	2	integer	\N	f	[1038,)
118	7	regions	3	character varying(30)	\N	f	[1038,)
119	7	ecosystem	4	character varying(30)	\N	f	[1038,)
120	7	gps_date	5	date	\N	f	[1038,)
121	7	barr_code	6	character varying(20)	\N	f	[1038,)
122	7	barr_actio	7	character varying(10)	\N	f	[1038,)
123	7	barr_type	8	character varying(25)	\N	f	[1038,)
124	7	comments	9	character varying(254)	\N	f	[1038,)
125	7	primary_ob	10	character varying(25)	\N	f	[1038,)
126	7	secondary_	11	character varying(25)	\N	f	[1038,)
127	7	project_na	12	character varying(25)	\N	f	[1038,)
128	7	barr_miles	13	numeric	\N	f	[1038,)
129	7	barr_km	14	numeric	\N	f	[1038,)
130	7	previously	15	character varying(10)	\N	f	[1038,)
131	7	gps_photo	16	character varying(3)	\N	f	[1038,)
132	7	photo_azim	17	integer	\N	f	[1038,)
133	7	qa_qc	18	character varying(10)	\N	f	[1038,)
134	7	shape_stle	19	numeric	\N	f	[1038,)
135	7	shape_leng	20	numeric	\N	f	[1038,)
136	7	geom	21	geometry(MultiLineString,4326)	\N	f	[1038,)
137	8	gid	1	integer	nextval('dist_line_gid_seq'::regclass)	t	[1038,)
138	8	agency	2	numeric(10,0)	\N	f	[1038,)
139	8	region	3	character varying(30)	\N	f	[1038,)
140	8	ecosystem	4	character varying(30)	\N	f	[1038,)
141	8	gps_date	5	date	\N	f	[1038,)
142	8	dist_code	6	character varying(20)	\N	f	[1038,)
143	8	dist_use	7	character varying(25)	\N	f	[1038,)
144	8	use_freq	8	character varying(3)	\N	f	[1038,)
145	8	use_recent	9	character varying(3)	\N	f	[1038,)
146	8	site_stabi	10	character varying(10)	\N	f	[1038,)
147	8	dist_crust	11	character varying(25)	\N	f	[1038,)
148	8	undist_cru	12	character varying(25)	\N	f	[1038,)
149	8	depth	13	character varying(20)	\N	f	[1038,)
150	8	width	14	character varying(20)	\N	f	[1038,)
151	8	type	15	character varying(15)	\N	f	[1038,)
152	8	plant_dama	16	character varying(40)	\N	f	[1038,)
153	8	accessibil	17	character varying(10)	\N	f	[1038,)
154	8	visibility	18	character varying(10)	\N	f	[1038,)
155	8	comments	19	character varying(254)	\N	f	[1038,)
156	8	primary_ob	20	character varying(25)	\N	f	[1038,)
157	8	secondary_	21	character varying(25)	\N	f	[1038,)
158	8	miles_dist	22	numeric	\N	f	[1038,)
159	8	km_dist	23	numeric	\N	f	[1038,)
160	8	treated	24	character varying(3)	\N	f	[1038,)
161	8	dist_sever	25	numeric(10,0)	\N	f	[1038,)
162	8	cultural	26	character varying(3)	\N	f	[1038,)
163	8	t_e_specie	27	character varying(3)	\N	f	[1038,)
164	8	gps_photo	28	character varying(3)	\N	f	[1038,)
165	8	soil_vulne	29	character varying(20)	\N	f	[1038,)
166	8	photo_azim	30	numeric(10,0)	\N	f	[1038,)
167	8	qa_qc	31	character varying(10)	\N	f	[1038,)
168	8	old_dist_c	32	character varying(100)	\N	f	[1038,)
169	8	shape_leng	33	numeric	\N	f	[1038,)
170	8	geom	34	geometry(MultiLineString)	\N	f	[1038,)
171	9	gid	1	integer	\N	t	[1038,)
172	9	agency	2	integer	\N	f	[1038,)
173	9	region	3	character varying(30)	\N	f	[1038,)
174	9	ecosystem	4	character varying(30)	\N	f	[1038,)
175	9	gps_date	5	date	\N	f	[1038,)
176	9	dist_code	6	character varying(20)	\N	f	[1038,)
177	9	use_freq	7	character varying(3)	\N	f	[1038,)
178	9	use_recent	8	character varying(3)	\N	f	[1038,)
179	9	dist_pt_ty	9	character varying(25)	\N	f	[1038,)
180	9	accessibil	10	character varying(10)	\N	f	[1038,)
181	9	visibility	11	character varying(10)	\N	f	[1038,)
182	9	comments	12	character varying(254)	\N	f	[1038,)
183	9	primary_ob	13	character varying(25)	\N	f	[1038,)
184	9	secondary_	14	character varying(25)	\N	f	[1038,)
185	9	previously	15	character varying(3)	\N	f	[1038,)
186	9	project_na	16	character varying(25)	\N	f	[1038,)
187	9	estimate_s	17	numeric(10,0)	\N	f	[1038,)
188	9	treated	18	character varying(3)	\N	f	[1038,)
189	9	cultural	19	character varying(3)	\N	f	[1038,)
190	9	t_e_specie	20	character varying(3)	\N	f	[1038,)
191	9	gps_photo	21	character varying(3)	\N	f	[1038,)
192	9	soil_vulne	22	character varying(20)	\N	f	[1038,)
193	9	dist_use	23	character varying(25)	\N	f	[1038,)
194	9	photo_azim	24	integer	\N	f	[1038,)
195	9	qa_qc	25	character varying(10)	\N	f	[1038,)
196	9	old_distco	26	character varying(50)	\N	f	[1038,)
197	9	geom	27	geometry(Point,4326)	\N	f	[1038,)
198	10	gid	1	integer	nextval('dist_point_gid_seq'::regclass)	t	[1038,)
199	10	agency	2	numeric(10,0)	\N	f	[1038,)
200	10	region	3	character varying(30)	\N	f	[1038,)
201	10	ecosystem	4	character varying(30)	\N	f	[1038,)
202	10	gps_date	5	date	\N	f	[1038,)
203	10	dist_code	6	character varying(20)	\N	f	[1038,)
204	10	use_freq	7	character varying(3)	\N	f	[1038,)
205	10	use_recent	8	character varying(3)	\N	f	[1038,)
206	10	dist_pt_ty	9	character varying(25)	\N	f	[1038,)
207	10	accessibil	10	character varying(10)	\N	f	[1038,)
208	10	visibility	11	character varying(10)	\N	f	[1038,)
209	10	comments	12	character varying(254)	\N	f	[1038,)
210	10	primary_ob	13	character varying(25)	\N	f	[1038,)
211	10	secondary_	14	character varying(25)	\N	f	[1038,)
212	10	previously	15	character varying(3)	\N	f	[1038,)
213	10	project_na	16	character varying(25)	\N	f	[1038,)
214	10	estimate_s	17	numeric(10,0)	\N	f	[1038,)
215	10	treated	18	character varying(3)	\N	f	[1038,)
216	10	cultural	19	character varying(3)	\N	f	[1038,)
217	10	t_e_specie	20	character varying(3)	\N	f	[1038,)
218	10	gps_photo	21	character varying(3)	\N	f	[1038,)
219	10	soil_vulne	22	character varying(20)	\N	f	[1038,)
220	10	dist_use	23	character varying(25)	\N	f	[1038,)
221	10	photo_azim	24	numeric(10,0)	\N	f	[1038,)
222	10	qa_qc	25	character varying(10)	\N	f	[1038,)
223	10	old_distco	26	character varying(50)	\N	f	[1038,)
224	10	geom	27	geometry(Point)	\N	f	[1038,)
225	11	gid	1	integer	nextval('dist_poly_centroid_gid_seq'::regclass)	t	[1038,)
226	11	agency	2	numeric(10,0)	\N	f	[1038,)
227	11	regions	3	character varying(30)	\N	f	[1038,)
228	11	ecosystem	4	character varying(30)	\N	f	[1038,)
229	11	gps_date	5	date	\N	f	[1038,)
230	11	dist_code	6	character varying(20)	\N	f	[1038,)
231	11	dist_use	7	character varying(25)	\N	f	[1038,)
232	11	use_freq	8	character varying(3)	\N	f	[1038,)
233	11	use_recent	9	character varying(3)	\N	f	[1038,)
234	11	site_stabi	10	character varying(10)	\N	f	[1038,)
235	11	dist_crust	11	character varying(25)	\N	f	[1038,)
236	11	undist_cru	12	character varying(25)	\N	f	[1038,)
237	11	depth	13	character varying(20)	\N	f	[1038,)
238	11	dist_poly_	14	character varying(30)	\N	f	[1038,)
239	11	plant_dama	15	character varying(40)	\N	f	[1038,)
240	11	assessibil	16	character varying(10)	\N	f	[1038,)
241	11	visibility	17	character varying(10)	\N	f	[1038,)
242	11	comments	18	character varying(254)	\N	f	[1038,)
243	11	primary_ob	19	character varying(25)	\N	f	[1038,)
244	11	secondary_	20	character varying(25)	\N	f	[1038,)
245	11	acres_rest	21	numeric	\N	f	[1038,)
246	11	kmsq_resto	22	numeric	\N	f	[1038,)
247	11	treated	23	character varying(3)	\N	f	[1038,)
248	11	dist_sever	24	numeric(10,0)	\N	f	[1038,)
249	11	cultural	25	character varying(3)	\N	f	[1038,)
250	11	t_e_specie	26	character varying(3)	\N	f	[1038,)
251	11	gps_photo	27	character varying(3)	\N	f	[1038,)
252	11	site_vulne	28	character varying(20)	\N	f	[1038,)
253	11	photo_azim	29	numeric(10,0)	\N	f	[1038,)
254	11	qa_qc	30	character varying(10)	\N	f	[1038,)
255	11	old_distco	31	character varying(50)	\N	f	[1038,)
256	11	orig_fid	32	numeric(10,0)	\N	f	[1038,)
257	11	geom	33	geometry(Point)	\N	f	[1038,)
258	12	gid	1	integer	\N	t	[1038,)
259	12	agency	2	integer	\N	f	[1038,)
260	12	regions	3	character varying(30)	\N	f	[1038,)
261	12	ecosystem	4	character varying(30)	\N	f	[1038,)
262	12	gps_date	5	date	\N	f	[1038,)
263	12	dist_code	6	character varying(20)	\N	f	[1038,)
264	12	dist_use	7	character varying(25)	\N	f	[1038,)
265	12	use_freq	8	character varying(3)	\N	f	[1038,)
266	12	use_recent	9	character varying(3)	\N	f	[1038,)
267	12	site_stabi	10	character varying(10)	\N	f	[1038,)
268	12	dist_crust	11	character varying(25)	\N	f	[1038,)
269	12	undist_cru	12	character varying(25)	\N	f	[1038,)
270	12	depth	13	character varying(20)	\N	f	[1038,)
271	12	dist_poly_	14	character varying(30)	\N	f	[1038,)
272	12	plant_dama	15	character varying(40)	\N	f	[1038,)
273	12	assessibil	16	character varying(10)	\N	f	[1038,)
274	12	visibility	17	character varying(10)	\N	f	[1038,)
275	12	comments	18	character varying(254)	\N	f	[1038,)
276	12	primary_ob	19	character varying(25)	\N	f	[1038,)
277	12	secondary_	20	character varying(25)	\N	f	[1038,)
278	12	acres_rest	21	numeric	\N	f	[1038,)
279	12	kmsq_resto	22	numeric	\N	f	[1038,)
280	12	treated	23	character varying(3)	\N	f	[1038,)
281	12	dist_sever	24	integer	\N	f	[1038,)
282	12	cultural	25	character varying(3)	\N	f	[1038,)
283	12	t_e_specie	26	character varying(3)	\N	f	[1038,)
284	12	gps_photo	27	character varying(3)	\N	f	[1038,)
285	12	site_vulne	28	character varying(20)	\N	f	[1038,)
286	12	photo_azim	29	integer	\N	f	[1038,)
287	12	qa_qc	30	character varying(10)	\N	f	[1038,)
288	12	old_distco	31	character varying(50)	\N	f	[1038,)
289	12	shape_star	32	numeric	\N	f	[1038,)
290	12	shape_stle	33	numeric	\N	f	[1038,)
291	12	shape_leng	34	numeric	\N	f	[1038,)
292	12	shape_area	35	numeric	\N	f	[1038,)
293	12	geom	36	geometry(MultiPolygon,4326)	\N	f	[1038,)
294	13	gid	1	integer	nextval('dist_polygon_gid_seq'::regclass)	t	[1038,)
295	13	agency	2	numeric(10,0)	\N	f	[1038,)
296	13	regions	3	character varying(30)	\N	f	[1038,)
297	13	ecosystem	4	character varying(30)	\N	f	[1038,)
298	13	gps_date	5	date	\N	f	[1038,)
299	13	dist_code	6	character varying(20)	\N	f	[1038,)
300	13	dist_use	7	character varying(25)	\N	f	[1038,)
301	13	use_freq	8	character varying(3)	\N	f	[1038,)
302	13	use_recent	9	character varying(3)	\N	f	[1038,)
303	13	site_stabi	10	character varying(10)	\N	f	[1038,)
304	13	dist_crust	11	character varying(25)	\N	f	[1038,)
305	13	undist_cru	12	character varying(25)	\N	f	[1038,)
306	13	depth	13	character varying(20)	\N	f	[1038,)
307	13	dist_poly_	14	character varying(30)	\N	f	[1038,)
308	13	plant_dama	15	character varying(40)	\N	f	[1038,)
309	13	assessibil	16	character varying(10)	\N	f	[1038,)
310	13	visibility	17	character varying(10)	\N	f	[1038,)
311	13	comments	18	character varying(254)	\N	f	[1038,)
312	13	primary_ob	19	character varying(25)	\N	f	[1038,)
313	13	secondary_	20	character varying(25)	\N	f	[1038,)
314	13	acres_rest	21	numeric	\N	f	[1038,)
315	13	kmsq_resto	22	numeric	\N	f	[1038,)
316	13	treated	23	character varying(3)	\N	f	[1038,)
317	13	dist_sever	24	numeric(10,0)	\N	f	[1038,)
318	13	cultural	25	character varying(3)	\N	f	[1038,)
319	13	t_e_specie	26	character varying(3)	\N	f	[1038,)
320	13	gps_photo	27	character varying(3)	\N	f	[1038,)
321	13	site_vulne	28	character varying(20)	\N	f	[1038,)
322	13	photo_azim	29	numeric(10,0)	\N	f	[1038,)
323	13	qa_qc	30	character varying(10)	\N	f	[1038,)
324	13	old_distco	31	character varying(50)	\N	f	[1038,)
325	13	shape_leng	32	numeric	\N	f	[1038,)
326	13	shape_area	33	numeric	\N	f	[1038,)
327	13	geom	34	geometry(MultiPolygon)	\N	f	[1038,)
328	14	gid	1	integer	\N	t	[1038,)
329	14	agency	2	integer	\N	f	[1038,)
330	14	region	3	character varying(30)	\N	f	[1038,)
331	14	ecosystem	4	character varying(30)	\N	f	[1038,)
332	14	gps_date	5	date	\N	f	[1038,)
333	14	dist_code	6	character varying(20)	\N	f	[1038,)
334	14	dist_use	7	character varying(25)	\N	f	[1038,)
335	14	use_freq	8	character varying(3)	\N	f	[1038,)
336	14	use_recent	9	character varying(3)	\N	f	[1038,)
337	14	site_stabi	10	character varying(10)	\N	f	[1038,)
338	14	dist_crust	11	character varying(25)	\N	f	[1038,)
339	14	undist_cru	12	character varying(25)	\N	f	[1038,)
340	14	depth	13	character varying(20)	\N	f	[1038,)
341	14	width	14	character varying(20)	\N	f	[1038,)
342	14	type	15	character varying(15)	\N	f	[1038,)
343	14	plant_dama	16	character varying(40)	\N	f	[1038,)
344	14	accessibil	17	character varying(10)	\N	f	[1038,)
345	14	visibility	18	character varying(10)	\N	f	[1038,)
346	14	comments	19	character varying(254)	\N	f	[1038,)
347	14	primary_ob	20	character varying(25)	\N	f	[1038,)
348	14	secondary_	21	character varying(25)	\N	f	[1038,)
349	14	miles_dist	22	numeric	\N	f	[1038,)
350	14	km_dist	23	numeric	\N	f	[1038,)
351	14	treated	24	character varying(3)	\N	f	[1038,)
352	14	dist_sever	25	integer	\N	f	[1038,)
353	14	cultural	26	character varying(3)	\N	f	[1038,)
354	14	t_e_specie	27	character varying(3)	\N	f	[1038,)
355	14	gps_photo	28	character varying(3)	\N	f	[1038,)
356	14	soil_vulne	29	character varying(20)	\N	f	[1038,)
357	14	photo_azim	30	integer	\N	f	[1038,)
358	14	qa_qc	31	character varying(10)	\N	f	[1038,)
359	14	old_dist_c	32	character varying(100)	\N	f	[1038,)
360	14	shape_stle	33	numeric	\N	f	[1038,)
361	14	shape_leng	34	numeric	\N	f	[1038,)
362	14	geom	35	geometry(MultiLineString,4326)	\N	f	[1038,)
363	15	gid	1	integer	nextval('monitoring_1_gid_seq'::regclass)	t	[1038,)
364	15	agency	2	numeric(10,0)	\N	f	[1038,)
365	15	primary_ob	3	character varying(25)	\N	f	[1038,)
366	15	secondary_	4	character varying(25)	\N	f	[1038,)
367	15	gps_date	5	date	\N	f	[1038,)
368	15	gps_photo	6	character varying(3)	\N	f	[1038,)
369	15	photo_azim	7	numeric(10,0)	\N	f	[1038,)
370	15	reuse_disc	8	character varying(3)	\N	f	[1038,)
371	15	resto_inte	9	character varying(15)	\N	f	[1038,)
372	15	reveg_succ	10	character varying(15)	\N	f	[1038,)
373	15	comments	11	character varying(254)	\N	f	[1038,)
374	15	qa_qc	12	character varying(10)	\N	f	[1038,)
375	15	geom	13	geometry(Point)	\N	f	[1038,)
376	16	gid	1	integer	nextval('rest_poly_centroid_gid_seq'::regclass)	t	[1038,)
377	16	agency	2	numeric(10,0)	\N	f	[1038,)
378	16	region	3	character varying(30)	\N	f	[1038,)
379	16	ecosystem	4	character varying(50)	\N	f	[1038,)
380	16	resto_code	5	character varying(20)	\N	f	[1038,)
381	16	resto_acti	6	character varying(30)	\N	f	[1038,)
382	16	te_action	7	character varying(3)	\N	f	[1038,)
383	16	non_list_a	8	character varying(3)	\N	f	[1038,)
384	16	comments	9	character varying(254)	\N	f	[1038,)
385	16	primary_ob	10	character varying(25)	\N	f	[1038,)
386	16	secondary_	11	character varying(25)	\N	f	[1038,)
387	16	project_na	12	character varying(25)	\N	f	[1038,)
388	16	treatment_	13	character varying(7)	\N	f	[1038,)
389	16	acres_rest	14	numeric	\N	f	[1038,)
390	16	kmsq_resto	15	numeric	\N	f	[1038,)
391	16	gps_date	16	date	\N	f	[1038,)
392	16	gps_photo	17	character varying(3)	\N	f	[1038,)
393	16	photo_azim	18	numeric(10,0)	\N	f	[1038,)
394	16	signed	19	character varying(5)	\N	f	[1038,)
395	16	deep_till	20	character varying(5)	\N	f	[1038,)
396	16	barrier_in	21	character varying(5)	\N	f	[1038,)
397	16	mulch	22	character varying(11)	\N	f	[1038,)
398	16	monitoring	23	character varying(3)	\N	f	[1038,)
399	16	previously	24	character varying(10)	\N	f	[1038,)
400	16	orig_fid	25	numeric(10,0)	\N	f	[1038,)
401	16	geom	26	geometry(Point)	\N	f	[1038,)
402	17	gid	1	integer	nextval('resto_line_gid_seq'::regclass)	t	[1038,)
403	17	agency	2	numeric(10,0)	\N	f	[1038,)
404	17	region	3	character varying(30)	\N	f	[1038,)
405	17	ecosystem	4	character varying(30)	\N	f	[1038,)
406	17	gps_date	5	date	\N	f	[1038,)
407	17	resto_code	6	character varying(25)	\N	f	[1038,)
408	17	resto_act	7	character varying(50)	\N	f	[1038,)
409	17	te_act	8	character varying(5)	\N	f	[1038,)
410	17	nonlists_a	9	character varying(5)	\N	f	[1038,)
411	17	comments	10	character varying(254)	\N	f	[1038,)
412	17	primary_ob	11	character varying(25)	\N	f	[1038,)
413	17	secondary_	12	character varying(25)	\N	f	[1038,)
414	17	project_na	13	character varying(25)	\N	f	[1038,)
415	17	treatment_	14	character varying(10)	\N	f	[1038,)
416	17	signed	15	character varying(5)	\N	f	[1038,)
417	17	mulch	16	character varying(10)	\N	f	[1038,)
418	17	deep_till	17	character varying(5)	\N	f	[1038,)
419	17	barrier_in	18	character varying(5)	\N	f	[1038,)
420	17	miles_rest	19	numeric	\N	f	[1038,)
421	17	km_resto	20	numeric	\N	f	[1038,)
422	17	gps_photo	21	character varying(3)	\N	f	[1038,)
423	17	photo_azim	22	numeric(10,0)	\N	f	[1038,)
424	17	monitoring	23	character varying(3)	\N	f	[1038,)
425	17	previously	24	character varying(10)	\N	f	[1038,)
426	17	qa_qc	25	character varying(10)	\N	f	[1038,)
427	17	shape_leng	26	numeric	\N	f	[1038,)
428	17	geom	27	geometry(MultiLineString)	\N	f	[1038,)
429	18	gid	1	integer	\N	t	[1038,)
430	18	agency	2	integer	\N	f	[1038,)
431	18	region	3	character varying(30)	\N	f	[1038,)
432	18	ecosystem	4	character varying(30)	\N	f	[1038,)
433	18	gps_date	5	date	\N	f	[1038,)
434	18	resto_code	6	character varying(25)	\N	f	[1038,)
435	18	resto_act	7	character varying(50)	\N	f	[1038,)
436	18	te_act	8	character varying(5)	\N	f	[1038,)
437	18	nonlists_a	9	character varying(5)	\N	f	[1038,)
438	18	comments	10	character varying(254)	\N	f	[1038,)
439	18	primary_ob	11	character varying(25)	\N	f	[1038,)
440	18	secondary_	12	character varying(25)	\N	f	[1038,)
441	18	project_na	13	character varying(25)	\N	f	[1038,)
442	18	treatment_	14	character varying(10)	\N	f	[1038,)
443	18	signed	15	character varying(5)	\N	f	[1038,)
444	18	mulch	16	character varying(10)	\N	f	[1038,)
445	18	deep_till	17	character varying(5)	\N	f	[1038,)
446	18	barrier_in	18	character varying(5)	\N	f	[1038,)
447	18	miles_rest	19	numeric	\N	f	[1038,)
448	18	km_resto	20	numeric	\N	f	[1038,)
449	18	gps_photo	21	character varying(3)	\N	f	[1038,)
450	18	photo_azim	22	integer	\N	f	[1038,)
451	18	monitoring	23	character varying(3)	\N	f	[1038,)
452	18	previously	24	character varying(10)	\N	f	[1038,)
453	18	qa_qc	25	character varying(10)	\N	f	[1038,)
454	18	shape_stle	26	numeric	\N	f	[1038,)
455	18	shape_leng	27	numeric	\N	f	[1038,)
456	18	geom	28	geometry(MultiLineString,4326)	\N	f	[1038,)
457	19	gid	1	integer	nextval('soil_vulnerability_gid_seq'::regclass)	t	[1038,)
458	19	objectid	2	numeric(10,0)	\N	f	[1038,)
459	19	fid_nevada	3	numeric(10,0)	\N	f	[1038,)
460	19	fid_neva_1	4	numeric(10,0)	\N	f	[1038,)
461	19	restoratio	5	numeric	\N	f	[1038,)
462	19	perimeter	6	numeric	\N	f	[1038,)
463	19	fmatn	7	character varying(6)	\N	f	[1038,)
464	19	l_name	8	character varying(50)	\N	f	[1038,)
465	19	geologicfm	9	character varying(16)	\N	f	[1038,)
466	19	statemap	10	character varying(16)	\N	f	[1038,)
467	19	county	11	character varying(50)	\N	f	[1038,)
468	19	bioagemax	12	numeric(10,0)	\N	f	[1038,)
469	19	bioagemin	13	numeric(10,0)	\N	f	[1038,)
470	19	modpoly	14	character varying(50)	\N	f	[1038,)
471	19	notes	15	character varying(250)	\N	f	[1038,)
472	19	refs	16	character varying(50)	\N	f	[1038,)
473	19	reviewed	17	character varying(10)	\N	f	[1038,)
474	19	shape_leng	18	numeric	\N	f	[1038,)
475	19	vulfmatn	19	numeric	\N	f	[1038,)
476	19	vulgeologi	20	numeric	\N	f	[1038,)
477	19	fid_nvcoun	21	numeric(10,0)	\N	f	[1038,)
478	19	fid_nvco_1	22	numeric(10,0)	\N	f	[1038,)
479	19	area_1	23	numeric	\N	f	[1038,)
480	19	perimete_1	24	numeric	\N	f	[1038,)
481	19	county_nam	25	character varying(32)	\N	f	[1038,)
482	19	area__sq_m	26	numeric	\N	f	[1038,)
483	19	comment	27	character varying(64)	\N	f	[1038,)
484	19	acres	28	numeric	\N	f	[1038,)
485	19	fid_swland	29	numeric(10,0)	\N	f	[1038,)
486	19	area_12	30	numeric	\N	f	[1038,)
487	19	perimete_2	31	numeric	\N	f	[1038,)
488	19	ca_landow_	32	numeric(10,0)	\N	f	[1038,)
489	19	ca_landow1	33	numeric(10,0)	\N	f	[1038,)
490	19	region	34	character varying(3)	\N	f	[1038,)
491	19	owner	35	numeric(10,0)	\N	f	[1038,)
492	19	source	36	numeric(10,0)	\N	f	[1038,)
493	19	macode	37	character varying(10)	\N	f	[1038,)
494	19	status	38	numeric(10,0)	\N	f	[1038,)
495	19	matype	39	character varying(5)	\N	f	[1038,)
496	19	owner_name	40	character varying(50)	\N	f	[1038,)
497	19	new_owner	41	character varying(50)	\N	f	[1038,)
498	19	name	42	character varying(50)	\N	f	[1038,)
499	19	state	43	character varying(50)	\N	f	[1038,)
500	19	fid_surfac	44	numeric(10,0)	\N	f	[1038,)
501	19	fid_surf_1	45	numeric(10,0)	\N	f	[1038,)
502	19	areasymbol	46	character varying(20)	\N	f	[1038,)
503	19	spatialver	47	numeric	\N	f	[1038,)
504	19	musym	48	character varying(6)	\N	f	[1038,)
505	19	mukey	49	character varying(30)	\N	f	[1038,)
506	19	mukey_1	50	character varying(10)	\N	f	[1038,)
507	19	surftext	51	character varying(254)	\N	f	[1038,)
508	19	stmergevul	52	numeric	\N	f	[1038,)
509	19	fid_nvco_2	53	numeric(10,0)	\N	f	[1038,)
510	19	fid_nvco_3	54	numeric(10,0)	\N	f	[1038,)
511	19	area_12_13	55	numeric	\N	f	[1038,)
512	19	perimete_3	56	numeric	\N	f	[1038,)
513	19	county_n_1	57	character varying(32)	\N	f	[1038,)
514	19	area__sq_1	58	numeric	\N	f	[1038,)
515	19	comment_1	59	character varying(64)	\N	f	[1038,)
516	19	acres_1	60	numeric	\N	f	[1038,)
517	19	fid_swla_1	61	numeric(10,0)	\N	f	[1038,)
518	19	area_12_14	62	numeric	\N	f	[1038,)
519	19	perimete_4	63	numeric	\N	f	[1038,)
520	19	ca_lando_1	64	numeric(10,0)	\N	f	[1038,)
521	19	ca_lando_2	65	numeric(10,0)	\N	f	[1038,)
522	19	region_1	66	character varying(3)	\N	f	[1038,)
523	19	owner_1	67	numeric(10,0)	\N	f	[1038,)
524	19	source_1	68	numeric(10,0)	\N	f	[1038,)
525	19	macode_1	69	character varying(10)	\N	f	[1038,)
526	19	status_1	70	numeric(10,0)	\N	f	[1038,)
527	19	matype_1	71	character varying(5)	\N	f	[1038,)
528	19	owner_na_1	72	character varying(50)	\N	f	[1038,)
529	19	new_owne_1	73	character varying(50)	\N	f	[1038,)
530	19	name_1	74	character varying(50)	\N	f	[1038,)
531	19	state_1	75	character varying(50)	\N	f	[1038,)
532	19	shape_le_1	76	numeric	\N	f	[1038,)
533	19	shape_le_2	77	numeric	\N	f	[1038,)
534	19	shape_area	78	numeric	\N	f	[1038,)
535	19	geom	79	geometry(MultiPolygon)	\N	f	[1038,)
\.


--
-- Data for Name: audit_table_log; Type: TABLE DATA; Schema: pgmemento; Owner: ubuntu
--

COPY audit_table_log (id, relid, schema_name, table_name, txid_range) FROM stdin;
1	16686	public	spatial_ref_sys	[1038,)
2	18037	public	resto_point	[1038,)
3	18051	public	resto_polygon	[1038,)
4	18045	public	resto_point_sub	[1038,)
5	18059	public	resto_polygon_sub	[1038,)
6	17903	public	barrier	[1038,)
7	17911	public	barrier_sub	[1038,)
8	17925	public	dist_line	[1038,)
9	17947	public	dist_point_sub	[1038,)
10	17939	public	dist_point	[1038,)
11	17953	public	dist_poly_centroid	[1038,)
12	17969	public	dist_polygon_sub	[1038,)
13	17961	public	dist_polygon	[1038,)
14	17933	public	dist_line_sub	[1038,)
15	17999	public	monitoring_1	[1038,)
16	18015	public	rest_poly_centroid	[1038,)
17	18023	public	resto_line	[1038,)
18	18031	public	resto_line_sub	[1038,)
19	18081	public	soil_vulnerability	[1038,)
\.


--
-- Data for Name: row_log; Type: TABLE DATA; Schema: pgmemento; Owner: ubuntu
--

COPY row_log (id, event_id, audit_id, changes) FROM stdin;
1	1	504	\N
2	1	505	\N
3	1	506	\N
4	1	507	\N
5	1	508	\N
6	1	509	\N
7	1	510	\N
8	1	511	\N
9	1	512	\N
10	1	513	\N
11	1	514	\N
12	1	515	\N
13	1	517	\N
14	1	518	\N
15	1	519	\N
16	1	520	\N
17	1	521	\N
18	1	522	\N
19	1	523	\N
20	1	524	\N
21	1	525	\N
22	1	526	\N
23	1	527	\N
24	1	528	\N
25	1	529	\N
26	1	530	\N
27	1	531	\N
28	1	532	\N
29	1	533	\N
30	1	534	\N
31	1	535	\N
32	1	536	\N
33	1	538	\N
34	1	539	\N
35	1	540	\N
36	1	541	\N
37	1	542	\N
38	1	543	\N
39	1	544	\N
40	1	545	\N
41	1	546	\N
42	1	547	\N
43	1	548	\N
44	1	549	\N
45	1	550	\N
46	1	551	\N
47	1	552	\N
48	1	553	\N
49	1	554	\N
50	1	555	\N
51	1	556	\N
52	1	557	\N
53	1	558	\N
54	1	559	\N
55	1	560	\N
56	1	561	\N
57	1	562	\N
58	1	563	\N
59	1	564	\N
60	1	565	\N
61	1	566	\N
62	1	568	\N
63	1	569	\N
64	1	570	\N
65	1	571	\N
66	1	572	\N
67	1	573	\N
68	1	574	\N
69	1	575	\N
70	1	576	\N
71	1	578	\N
72	1	579	\N
73	1	580	\N
74	1	581	\N
75	1	582	\N
76	1	583	\N
77	1	584	\N
78	1	585	\N
79	1	586	\N
80	1	588	\N
81	1	589	\N
82	1	590	\N
83	1	591	\N
84	1	592	\N
85	1	593	\N
86	1	594	\N
87	1	595	\N
88	1	596	\N
89	1	597	\N
90	1	598	\N
91	1	599	\N
92	1	600	\N
93	1	601	\N
94	1	602	\N
95	1	603	\N
96	1	604	\N
97	1	605	\N
98	1	606	\N
99	1	607	\N
100	1	609	\N
101	1	610	\N
102	1	611	\N
103	1	612	\N
104	1	613	\N
105	1	614	\N
106	1	615	\N
107	1	616	\N
108	1	617	\N
109	1	619	\N
110	1	620	\N
111	1	621	\N
112	1	622	\N
113	1	623	\N
114	1	624	\N
115	1	625	\N
116	1	626	\N
117	1	627	\N
118	1	629	\N
119	1	630	\N
120	1	631	\N
121	1	632	\N
122	1	633	\N
123	1	634	\N
124	1	635	\N
125	1	636	\N
126	1	637	\N
127	1	639	\N
128	1	640	\N
129	1	641	\N
130	1	642	\N
131	1	643	\N
132	1	644	\N
133	1	645	\N
134	1	646	\N
135	1	647	\N
136	1	649	\N
137	1	650	\N
138	1	651	\N
139	1	652	\N
140	1	653	\N
141	1	654	\N
142	1	655	\N
143	1	656	\N
144	1	657	\N
145	1	659	\N
146	1	660	\N
147	1	661	\N
148	1	662	\N
149	1	663	\N
150	1	664	\N
151	1	665	\N
152	1	666	\N
153	1	667	\N
154	1	669	\N
155	1	670	\N
156	1	671	\N
157	1	672	\N
158	1	673	\N
159	1	674	\N
160	1	675	\N
161	1	676	\N
162	1	677	\N
163	1	679	\N
164	1	680	\N
165	1	681	\N
166	1	682	\N
167	1	683	\N
168	1	684	\N
169	1	685	\N
170	1	686	\N
171	1	687	\N
172	1	689	\N
173	1	690	\N
174	1	691	\N
175	1	692	\N
176	1	693	\N
177	1	694	\N
178	1	695	\N
179	1	696	\N
180	1	697	\N
181	1	688	\N
182	1	699	\N
183	1	700	\N
184	1	701	\N
185	1	702	\N
186	1	703	\N
187	1	704	\N
188	1	705	\N
189	1	706	\N
190	1	707	\N
191	1	709	\N
192	1	710	\N
193	1	711	\N
194	1	712	\N
195	1	713	\N
196	1	714	\N
197	1	715	\N
198	1	716	\N
199	1	717	\N
200	1	648	\N
201	1	668	\N
202	1	719	\N
203	1	720	\N
204	1	721	\N
205	1	722	\N
206	1	723	\N
207	1	724	\N
208	1	725	\N
209	1	726	\N
210	1	727	\N
211	1	728	\N
212	1	729	\N
213	1	730	\N
214	1	731	\N
215	1	732	\N
216	1	733	\N
217	1	734	\N
218	1	735	\N
219	1	736	\N
220	1	737	\N
221	1	738	\N
222	1	739	\N
223	1	740	\N
224	1	741	\N
225	1	742	\N
226	1	743	\N
227	1	744	\N
228	1	745	\N
229	1	747	\N
230	1	748	\N
231	1	749	\N
232	1	750	\N
233	1	751	\N
234	1	752	\N
235	1	753	\N
236	1	754	\N
237	1	755	\N
238	1	756	\N
239	1	757	\N
240	1	758	\N
241	1	759	\N
242	1	760	\N
243	1	761	\N
244	1	762	\N
245	1	763	\N
246	1	765	\N
247	1	766	\N
248	1	767	\N
249	1	768	\N
250	1	769	\N
251	1	770	\N
252	1	771	\N
253	1	772	\N
254	1	773	\N
255	1	775	\N
256	1	776	\N
257	1	777	\N
258	1	778	\N
259	1	779	\N
260	1	780	\N
261	1	781	\N
262	1	782	\N
263	1	784	\N
264	1	785	\N
265	1	786	\N
266	1	787	\N
267	1	788	\N
268	1	789	\N
269	1	790	\N
270	1	791	\N
271	1	792	\N
272	1	793	\N
273	1	794	\N
274	1	795	\N
275	1	796	\N
276	1	797	\N
277	1	798	\N
278	1	799	\N
279	1	800	\N
280	1	801	\N
281	1	802	\N
282	1	803	\N
283	1	804	\N
284	1	805	\N
285	1	806	\N
286	1	807	\N
287	1	808	\N
288	1	809	\N
289	1	810	\N
290	1	811	\N
291	1	812	\N
292	1	813	\N
293	1	814	\N
294	1	815	\N
295	1	816	\N
296	1	817	\N
297	1	818	\N
298	1	819	\N
299	1	820	\N
300	1	821	\N
301	1	822	\N
302	1	823	\N
303	1	824	\N
304	1	825	\N
305	1	826	\N
306	1	827	\N
307	1	828	\N
308	1	718	\N
309	1	830	\N
310	1	831	\N
311	1	832	\N
312	1	833	\N
313	1	834	\N
314	1	835	\N
315	1	836	\N
316	1	837	\N
317	1	838	\N
318	1	839	\N
319	1	840	\N
320	1	841	\N
321	1	842	\N
322	1	843	\N
323	1	844	\N
324	1	845	\N
325	1	846	\N
326	1	847	\N
327	1	848	\N
328	1	849	\N
329	1	850	\N
330	1	851	\N
331	1	852	\N
332	1	853	\N
333	1	854	\N
334	1	855	\N
335	1	856	\N
336	1	857	\N
337	1	858	\N
338	1	859	\N
339	1	860	\N
340	1	861	\N
341	1	862	\N
342	1	863	\N
343	1	864	\N
344	1	865	\N
345	1	866	\N
346	1	867	\N
347	1	868	\N
348	1	869	\N
349	1	870	\N
350	1	871	\N
351	1	872	\N
352	1	873	\N
353	1	874	\N
354	1	875	\N
355	1	876	\N
356	1	877	\N
357	1	878	\N
358	1	879	\N
359	1	880	\N
360	1	881	\N
361	1	882	\N
362	1	883	\N
363	1	884	\N
364	1	885	\N
365	1	886	\N
366	1	887	\N
367	1	888	\N
368	1	889	\N
369	1	890	\N
370	1	891	\N
371	1	892	\N
372	1	893	\N
373	1	894	\N
374	1	896	\N
375	1	897	\N
376	1	898	\N
377	1	899	\N
378	1	900	\N
379	1	901	\N
380	1	902	\N
381	1	903	\N
382	1	904	\N
383	1	905	\N
384	1	906	\N
385	1	907	\N
386	1	908	\N
387	1	909	\N
388	1	910	\N
389	1	911	\N
390	1	912	\N
391	1	913	\N
392	1	914	\N
393	1	915	\N
394	1	916	\N
395	1	917	\N
396	1	918	\N
397	1	919	\N
398	1	920	\N
399	1	921	\N
400	1	922	\N
401	1	923	\N
402	1	924	\N
403	1	925	\N
404	1	926	\N
405	1	927	\N
406	1	928	\N
407	1	929	\N
408	1	930	\N
409	1	931	\N
410	1	932	\N
411	1	933	\N
412	1	934	\N
413	1	935	\N
414	1	936	\N
415	1	937	\N
416	1	938	\N
417	1	939	\N
418	1	940	\N
419	1	941	\N
420	1	942	\N
421	1	943	\N
422	1	944	\N
423	1	945	\N
424	1	946	\N
425	1	947	\N
426	1	948	\N
427	1	949	\N
428	1	950	\N
429	1	951	\N
430	1	952	\N
431	1	953	\N
432	1	954	\N
433	1	955	\N
434	1	956	\N
435	1	957	\N
436	1	958	\N
437	1	959	\N
438	1	960	\N
439	1	961	\N
440	1	962	\N
441	1	963	\N
442	1	964	\N
443	1	965	\N
444	1	966	\N
445	1	967	\N
446	1	968	\N
447	1	969	\N
448	1	970	\N
449	1	971	\N
450	1	972	\N
451	1	973	\N
452	1	974	\N
453	1	975	\N
454	1	976	\N
455	1	977	\N
456	1	978	\N
457	1	979	\N
458	1	980	\N
459	1	981	\N
460	1	982	\N
461	1	983	\N
462	1	984	\N
463	1	985	\N
464	1	986	\N
465	1	987	\N
466	1	988	\N
467	1	989	\N
468	1	990	\N
469	1	991	\N
470	1	992	\N
471	1	993	\N
472	1	994	\N
473	1	995	\N
474	1	996	\N
475	1	997	\N
476	1	998	\N
477	1	999	\N
478	1	1000	\N
479	1	1001	\N
480	1	1002	\N
481	1	1003	\N
482	1	1004	\N
483	1	1005	\N
484	1	1006	\N
485	1	1007	\N
486	1	1008	\N
487	1	1009	\N
488	1	1010	\N
489	1	1011	\N
490	1	1012	\N
491	1	1013	\N
492	1	1014	\N
493	1	1015	\N
494	1	1016	\N
495	1	1017	\N
496	1	1018	\N
497	1	1019	\N
498	1	1020	\N
499	1	1021	\N
500	1	1022	\N
501	1	1023	\N
502	1	1024	\N
503	1	1025	\N
504	1	1026	\N
505	1	1027	\N
506	1	1028	\N
507	1	1029	\N
508	1	1030	\N
509	1	1031	\N
510	1	1032	\N
511	1	1033	\N
512	1	1034	\N
513	1	1036	\N
514	1	1037	\N
515	1	1038	\N
516	1	1039	\N
517	1	1040	\N
518	1	1041	\N
519	1	1042	\N
520	1	1043	\N
521	1	1044	\N
522	1	1046	\N
523	1	1047	\N
524	1	1048	\N
525	1	1049	\N
526	1	1050	\N
527	1	1051	\N
528	1	1052	\N
529	1	1053	\N
530	1	1054	\N
531	1	1056	\N
532	1	1057	\N
533	1	1058	\N
534	1	1059	\N
535	1	1060	\N
536	1	1061	\N
537	1	1062	\N
538	1	1063	\N
539	1	1064	\N
540	1	1066	\N
541	1	1067	\N
542	1	1068	\N
543	1	1069	\N
544	1	1070	\N
545	1	1071	\N
546	1	1072	\N
547	1	1073	\N
548	1	1074	\N
549	1	1076	\N
550	1	1077	\N
551	1	1078	\N
552	1	1079	\N
553	1	1080	\N
554	1	1081	\N
555	1	1082	\N
556	1	1083	\N
557	1	1084	\N
558	1	1086	\N
559	1	1087	\N
560	1	1088	\N
561	1	1089	\N
562	1	1090	\N
563	1	1091	\N
564	1	1092	\N
565	1	1093	\N
566	1	1094	\N
567	1	1096	\N
568	1	1097	\N
569	1	1098	\N
570	1	1099	\N
571	1	1100	\N
572	1	1101	\N
573	1	1102	\N
574	1	1103	\N
575	1	1104	\N
576	1	1106	\N
577	1	1107	\N
578	1	1108	\N
579	1	1109	\N
580	1	1110	\N
581	1	1111	\N
582	1	1112	\N
583	1	1113	\N
584	1	1114	\N
585	1	1115	\N
586	1	1116	\N
587	1	1117	\N
588	1	1118	\N
589	1	1119	\N
590	1	1120	\N
591	1	1121	\N
592	1	1122	\N
593	1	1123	\N
594	1	1124	\N
595	1	1126	\N
596	1	1127	\N
597	1	1128	\N
598	1	1129	\N
599	1	1130	\N
600	1	1131	\N
601	1	1132	\N
602	1	1133	\N
603	1	1134	\N
604	1	1136	\N
605	1	1137	\N
606	1	1138	\N
607	1	1139	\N
608	1	1140	\N
609	1	1141	\N
610	1	1142	\N
611	1	1143	\N
612	1	1144	\N
613	1	1146	\N
614	1	1147	\N
615	1	1148	\N
616	1	1149	\N
617	1	1150	\N
618	1	1151	\N
619	1	1152	\N
620	1	1153	\N
621	1	1154	\N
622	1	1156	\N
623	1	1157	\N
624	1	1158	\N
625	1	1159	\N
626	1	1160	\N
627	1	1161	\N
628	1	1162	\N
629	1	1163	\N
630	1	1164	\N
631	1	1166	\N
632	1	1167	\N
633	1	1168	\N
634	1	1169	\N
635	1	1170	\N
636	1	1171	\N
637	1	1172	\N
638	1	1173	\N
639	1	1174	\N
640	1	1176	\N
641	1	1177	\N
642	1	1178	\N
643	1	1179	\N
644	1	1180	\N
645	1	1181	\N
646	1	1182	\N
647	1	1183	\N
648	1	1184	\N
649	1	1186	\N
650	1	1187	\N
651	1	1188	\N
652	1	1189	\N
653	1	1190	\N
654	1	1191	\N
655	1	1192	\N
656	1	1193	\N
657	1	1194	\N
658	1	1196	\N
659	1	1197	\N
660	1	1198	\N
661	1	1199	\N
662	1	1200	\N
663	1	1201	\N
664	1	1202	\N
665	1	1203	\N
666	1	1204	\N
667	1	1206	\N
668	1	1207	\N
669	1	1208	\N
670	1	1209	\N
671	1	1210	\N
672	1	1211	\N
673	1	1212	\N
674	1	1213	\N
675	1	1214	\N
676	1	1216	\N
677	1	1217	\N
678	1	1218	\N
679	1	1219	\N
680	1	1220	\N
681	1	1221	\N
682	1	1222	\N
683	1	1223	\N
684	1	1224	\N
685	1	1225	\N
686	1	1226	\N
687	1	1227	\N
688	1	1228	\N
689	1	1229	\N
690	1	1230	\N
691	1	1231	\N
692	1	1232	\N
693	1	1233	\N
694	1	1234	\N
695	1	1235	\N
696	1	1236	\N
697	1	1237	\N
698	1	1238	\N
699	1	1239	\N
700	1	1240	\N
701	1	1241	\N
702	1	1242	\N
703	1	1243	\N
704	1	1244	\N
705	1	1245	\N
706	1	1246	\N
707	1	1247	\N
708	1	1248	\N
709	1	1249	\N
710	1	1250	\N
711	1	1251	\N
712	1	1252	\N
713	1	1253	\N
714	1	1254	\N
715	1	1255	\N
716	1	1155	\N
717	1	1256	\N
718	1	1257	\N
719	1	1258	\N
720	1	1259	\N
721	1	1260	\N
722	1	1261	\N
723	1	1262	\N
724	1	1263	\N
725	1	1264	\N
726	1	1265	\N
727	1	1266	\N
728	1	1267	\N
729	1	1268	\N
730	1	1269	\N
731	1	1270	\N
732	1	1271	\N
733	1	1272	\N
734	1	1273	\N
735	1	1274	\N
736	1	1275	\N
737	1	1276	\N
738	1	1277	\N
739	1	1278	\N
740	1	1279	\N
741	1	1280	\N
742	1	1281	\N
743	1	1282	\N
744	1	1283	\N
745	1	1284	\N
746	1	1285	\N
747	1	1286	\N
748	1	1287	\N
749	1	1288	\N
750	1	1289	\N
751	1	1290	\N
752	1	1291	\N
753	1	1292	\N
754	1	1293	\N
755	1	1294	\N
756	1	1295	\N
757	1	1296	\N
758	1	1297	\N
759	1	1298	\N
760	1	1299	\N
761	1	1300	\N
762	1	1301	\N
763	1	1302	\N
764	1	1303	\N
765	1	1304	\N
766	1	1305	\N
767	1	1306	\N
768	1	1307	\N
769	1	1308	\N
770	1	1309	\N
771	1	1310	\N
772	1	1311	\N
773	1	1312	\N
774	1	1313	\N
775	1	1314	\N
776	1	1315	\N
777	1	1316	\N
778	1	1317	\N
779	1	1318	\N
780	1	1320	\N
781	1	1321	\N
782	1	1322	\N
783	1	1323	\N
784	1	1324	\N
785	1	1325	\N
786	1	1326	\N
787	1	1327	\N
788	1	1329	\N
789	1	1330	\N
790	1	1331	\N
791	1	1332	\N
792	1	1333	\N
793	1	1334	\N
794	1	1335	\N
795	1	1336	\N
796	1	1337	\N
797	1	1338	\N
798	1	1339	\N
799	1	1340	\N
800	1	1341	\N
801	1	1342	\N
802	1	1343	\N
803	1	1344	\N
804	1	1345	\N
805	1	1346	\N
806	1	1347	\N
807	1	1348	\N
808	1	1349	\N
809	1	1350	\N
810	1	1351	\N
811	1	1352	\N
812	1	1353	\N
813	1	1354	\N
814	1	1356	\N
815	1	1357	\N
816	1	1358	\N
817	1	1359	\N
818	1	1360	\N
819	1	1361	\N
820	1	1362	\N
821	1	1363	\N
822	1	1365	\N
823	1	1366	\N
824	1	1367	\N
825	1	1368	\N
826	1	1369	\N
827	1	1370	\N
828	1	1371	\N
829	1	1372	\N
830	1	1373	\N
831	1	1374	\N
832	1	1375	\N
833	1	1376	\N
834	1	1377	\N
835	1	1378	\N
836	1	1379	\N
837	1	1380	\N
838	1	1382	\N
839	1	1383	\N
840	1	1384	\N
841	1	1385	\N
842	1	1386	\N
843	1	1387	\N
844	1	1388	\N
845	1	1389	\N
846	1	1355	\N
847	1	1391	\N
848	1	1392	\N
849	1	1393	\N
850	1	1394	\N
851	1	1395	\N
852	1	1396	\N
853	1	1397	\N
854	1	1398	\N
855	1	1399	\N
856	1	1400	\N
857	1	1401	\N
858	1	1402	\N
859	1	1403	\N
860	1	1404	\N
861	1	1405	\N
862	1	1406	\N
863	1	1407	\N
864	1	1408	\N
865	1	1409	\N
866	1	1410	\N
867	1	1411	\N
868	1	1412	\N
869	1	1413	\N
870	1	1414	\N
871	1	1416	\N
872	1	1417	\N
873	1	1418	\N
874	1	1419	\N
875	1	1420	\N
876	1	1421	\N
877	1	1422	\N
878	1	1423	\N
879	1	1424	\N
880	1	1425	\N
881	1	1426	\N
882	1	1427	\N
883	1	1428	\N
884	1	1429	\N
885	1	1430	\N
886	1	1431	\N
887	1	1433	\N
888	1	1434	\N
889	1	1435	\N
890	1	1436	\N
891	1	1437	\N
892	1	1438	\N
893	1	1439	\N
894	1	1440	\N
895	1	1441	\N
896	1	1442	\N
897	1	1443	\N
898	1	1444	\N
899	1	1445	\N
900	1	1446	\N
901	1	1447	\N
902	1	1449	\N
903	1	1450	\N
904	1	1451	\N
905	1	1452	\N
906	1	1453	\N
907	1	1454	\N
908	1	1455	\N
909	1	1456	\N
910	1	1390	\N
911	1	1457	\N
912	1	1458	\N
913	1	1459	\N
914	1	1460	\N
915	1	1461	\N
916	1	1462	\N
917	1	1463	\N
918	1	1464	\N
919	1	1465	\N
920	1	1432	\N
921	1	1448	\N
922	1	1466	\N
923	1	1467	\N
924	1	1468	\N
925	1	1469	\N
926	1	1470	\N
927	1	1471	\N
928	1	1472	\N
929	1	1473	\N
930	1	1474	\N
931	1	1476	\N
932	1	1477	\N
933	1	1478	\N
934	1	1479	\N
935	1	1480	\N
936	1	1481	\N
937	1	1482	\N
938	1	1483	\N
939	1	1484	\N
940	1	1485	\N
941	1	1486	\N
942	1	1487	\N
943	1	1488	\N
944	1	1489	\N
945	1	1490	\N
946	1	1491	\N
947	1	1492	\N
948	1	1493	\N
949	1	1494	\N
950	1	1496	\N
951	1	1497	\N
952	1	1498	\N
953	1	1499	\N
954	1	1500	\N
955	1	1501	\N
956	1	1502	\N
957	1	1503	\N
958	1	1504	\N
959	1	1505	\N
960	1	1506	\N
961	1	1507	\N
962	1	1508	\N
963	1	1509	\N
964	1	1510	\N
965	1	1511	\N
966	1	1512	\N
967	1	1513	\N
968	1	1514	\N
969	1	1515	\N
970	1	1516	\N
971	1	1517	\N
972	1	1518	\N
973	1	1519	\N
974	1	1520	\N
975	1	1521	\N
976	1	1522	\N
977	1	1523	\N
978	1	1524	\N
979	1	1525	\N
980	1	1526	\N
981	1	1527	\N
982	1	1528	\N
983	1	1529	\N
984	1	1530	\N
985	1	1531	\N
986	1	1532	\N
987	1	1533	\N
988	1	1534	\N
989	1	1475	\N
990	1	1035	\N
991	1	1045	\N
992	1	1055	\N
993	1	1065	\N
994	1	1536	\N
995	1	1537	\N
996	1	1538	\N
997	1	1539	\N
998	1	1540	\N
999	1	1541	\N
1000	1	1542	\N
1001	1	1543	\N
1002	1	1544	\N
1003	1	1545	\N
1004	1	1075	\N
1005	1	1085	\N
1006	1	1105	\N
1007	1	1546	\N
1008	1	1547	\N
1009	1	1548	\N
1010	1	1549	\N
1011	1	1550	\N
1012	1	1551	\N
1013	1	1552	\N
1014	1	1553	\N
1015	1	1554	\N
1016	1	1555	\N
1017	1	1125	\N
1018	1	1135	\N
1019	1	1145	\N
1020	1	1165	\N
1021	1	1175	\N
1022	1	1185	\N
1023	1	1195	\N
1024	1	1205	\N
1025	1	1215	\N
1026	1	1095	\N
1027	1	1556	\N
1028	1	1557	\N
1029	1	1558	\N
1030	1	1559	\N
1031	1	1560	\N
1032	1	1561	\N
1033	1	1562	\N
1034	1	1563	\N
1035	1	1564	\N
1036	1	1565	\N
1037	1	1566	\N
1038	1	1567	\N
1039	1	1568	\N
1040	1	1569	\N
1041	1	1570	\N
1042	1	1571	\N
1043	1	1572	\N
1044	1	1573	\N
1045	1	1574	\N
1046	1	1575	\N
1047	1	1576	\N
1048	1	1577	\N
1049	1	1578	\N
1050	1	1579	\N
1051	1	1580	\N
1052	1	1581	\N
1053	1	1582	\N
1054	1	1583	\N
1055	1	1584	\N
1056	1	1585	\N
1057	1	1586	\N
1058	1	1587	\N
1059	1	1588	\N
1060	1	1589	\N
1061	1	1590	\N
1062	1	1591	\N
1063	1	1592	\N
1064	1	1594	\N
1065	1	1595	\N
1066	1	1596	\N
1067	1	1597	\N
1068	1	1598	\N
1069	1	1599	\N
1070	1	1600	\N
1071	1	1601	\N
1072	1	1602	\N
1073	1	1603	\N
1074	1	1593	\N
1075	1	1604	\N
1076	1	1605	\N
1077	1	1606	\N
1078	1	1607	\N
1079	1	1608	\N
1080	1	1609	\N
1081	1	1610	\N
1082	1	1611	\N
1083	1	1612	\N
1084	1	1613	\N
1085	1	1614	\N
1086	1	1615	\N
1087	1	1616	\N
1088	1	1617	\N
1089	1	1618	\N
1090	1	1619	\N
1091	1	1620	\N
1092	1	1621	\N
1093	1	1622	\N
1094	1	1623	\N
1095	1	1624	\N
1096	1	1625	\N
1097	1	1626	\N
1098	1	1627	\N
1099	1	1628	\N
1100	1	1629	\N
1101	1	1630	\N
1102	1	1632	\N
1103	1	1633	\N
1104	1	1634	\N
1105	1	1635	\N
1106	1	1636	\N
1107	1	1637	\N
1108	1	1638	\N
1109	1	1639	\N
1110	1	1640	\N
1111	1	1641	\N
1112	1	1643	\N
1113	1	1644	\N
1114	1	1645	\N
1115	1	1646	\N
1116	1	1647	\N
1117	1	1648	\N
1118	1	1649	\N
1119	1	1650	\N
1120	1	1651	\N
1121	1	1653	\N
1122	1	1654	\N
1123	1	1655	\N
1124	1	1656	\N
1125	1	1657	\N
1126	1	1658	\N
1127	1	1659	\N
1128	1	1660	\N
1129	1	1661	\N
1130	1	1662	\N
1131	1	1663	\N
1132	1	1664	\N
1133	1	1665	\N
1134	1	1666	\N
1135	1	1667	\N
1136	1	1668	\N
1137	1	1669	\N
1138	1	1670	\N
1139	1	1672	\N
1140	1	1673	\N
1141	1	1674	\N
1142	1	1675	\N
1143	1	1676	\N
1144	1	1677	\N
1145	1	1678	\N
1146	1	1679	\N
1147	1	1680	\N
1148	1	1682	\N
1149	1	1683	\N
1150	1	1684	\N
1151	1	1685	\N
1152	1	1686	\N
1153	1	1687	\N
1154	1	1688	\N
1155	1	1689	\N
1156	1	1690	\N
1157	1	1691	\N
1158	1	1693	\N
1159	1	1694	\N
1160	1	1695	\N
1161	1	1696	\N
1162	1	1697	\N
1163	1	1698	\N
1164	1	1699	\N
1165	1	1700	\N
1166	1	1701	\N
1167	1	1703	\N
1168	1	1704	\N
1169	1	1705	\N
1170	1	1706	\N
1171	1	1707	\N
1172	1	1708	\N
1173	1	1709	\N
1174	1	1710	\N
1175	1	1711	\N
1176	1	1713	\N
1177	1	1714	\N
1178	1	1715	\N
1179	1	1716	\N
1180	1	1717	\N
1181	1	1718	\N
1182	1	1719	\N
1183	1	1720	\N
1184	1	1721	\N
1185	1	1722	\N
1186	1	1723	\N
1187	1	1724	\N
1188	1	1725	\N
1189	1	1726	\N
1190	1	1727	\N
1191	1	1728	\N
1192	1	1729	\N
1193	1	1730	\N
1194	1	1731	\N
1195	1	1732	\N
1196	1	1733	\N
1197	1	1734	\N
1198	1	1735	\N
1199	1	1736	\N
1200	1	1737	\N
1201	1	1738	\N
1202	1	1739	\N
1203	1	1740	\N
1204	1	1741	\N
1205	1	1742	\N
1206	1	1743	\N
1207	1	1744	\N
1208	1	1745	\N
1209	1	1746	\N
1210	1	1747	\N
1211	1	1748	\N
1212	1	1749	\N
1213	1	1750	\N
1214	1	1751	\N
1215	1	1752	\N
1216	1	1753	\N
1217	1	1754	\N
1218	1	1755	\N
1219	1	1756	\N
1220	1	1757	\N
1221	1	1758	\N
1222	1	1759	\N
1223	1	1760	\N
1224	1	1761	\N
1225	1	1762	\N
1226	1	1763	\N
1227	1	1764	\N
1228	1	1765	\N
1229	1	1766	\N
1230	1	1767	\N
1231	1	1768	\N
1232	1	1769	\N
1233	1	1770	\N
1234	1	1771	\N
1235	1	1772	\N
1236	1	1773	\N
1237	1	1774	\N
1238	1	1775	\N
1239	1	1776	\N
1240	1	1777	\N
1241	1	1778	\N
1242	1	1779	\N
1243	1	1780	\N
1244	1	1781	\N
1245	1	1782	\N
1246	1	1783	\N
1247	1	1784	\N
1248	1	1786	\N
1249	1	1787	\N
1250	1	1788	\N
1251	1	1789	\N
1252	1	1790	\N
1253	1	1791	\N
1254	1	1792	\N
1255	1	1793	\N
1256	1	1794	\N
1257	1	1795	\N
1258	1	1796	\N
1259	1	1797	\N
1260	1	1798	\N
1261	1	1799	\N
1262	1	1800	\N
1263	1	1801	\N
1264	1	1802	\N
1265	1	1803	\N
1266	1	1804	\N
1267	1	1805	\N
1268	1	1806	\N
1269	1	1807	\N
1270	1	1808	\N
1271	1	1809	\N
1272	1	1810	\N
1273	1	1811	\N
1274	1	1812	\N
1275	1	1813	\N
1276	1	1814	\N
1277	1	1815	\N
1278	1	1816	\N
1279	1	1817	\N
1280	1	1818	\N
1281	1	1819	\N
1282	1	1820	\N
1283	1	1821	\N
1284	1	1822	\N
1285	1	1823	\N
1286	1	1825	\N
1287	1	1826	\N
1288	1	1827	\N
1289	1	1828	\N
1290	1	1829	\N
1291	1	1830	\N
1292	1	1831	\N
1293	1	1832	\N
1294	1	1833	\N
1295	1	1835	\N
1296	1	1836	\N
1297	1	1837	\N
1298	1	1838	\N
1299	1	1839	\N
1300	1	1840	\N
1301	1	1841	\N
1302	1	1842	\N
1303	1	1843	\N
1304	1	1845	\N
1305	1	1846	\N
1306	1	1847	\N
1307	1	1848	\N
1308	1	1849	\N
1309	1	1850	\N
1310	1	1851	\N
1311	1	1852	\N
1312	1	1853	\N
1313	1	1834	\N
1314	1	1855	\N
1315	1	1856	\N
1316	1	1857	\N
1317	1	1858	\N
1318	1	1859	\N
1319	1	1860	\N
1320	1	1861	\N
1321	1	1862	\N
1322	1	1863	\N
1323	1	1864	\N
1324	1	1865	\N
1325	1	1866	\N
1326	1	1867	\N
1327	1	1868	\N
1328	1	1869	\N
1329	1	1870	\N
1330	1	1871	\N
1331	1	1872	\N
1332	1	1874	\N
1333	1	1875	\N
1334	1	1876	\N
1335	1	1877	\N
1336	1	1878	\N
1337	1	1879	\N
1338	1	1880	\N
1339	1	1881	\N
1340	1	1882	\N
1341	1	1883	\N
1342	1	516	\N
1343	1	1884	\N
1344	1	1885	\N
1345	1	1886	\N
1346	1	1887	\N
1347	1	1888	\N
1348	1	1889	\N
1349	1	1890	\N
1350	1	1891	\N
1351	1	1892	\N
1352	1	1894	\N
1353	1	1895	\N
1354	1	1896	\N
1355	1	1897	\N
1356	1	1898	\N
1357	1	1899	\N
1358	1	1900	\N
1359	1	1901	\N
1360	1	1902	\N
1361	1	1903	\N
1362	1	1904	\N
1363	1	1905	\N
1364	1	1906	\N
1365	1	1907	\N
1366	1	1908	\N
1367	1	1909	\N
1368	1	1910	\N
1369	1	1911	\N
1370	1	1912	\N
1371	1	1913	\N
1372	1	1915	\N
1373	1	1916	\N
1374	1	1917	\N
1375	1	1918	\N
1376	1	1919	\N
1377	1	1920	\N
1378	1	1921	\N
1379	1	1922	\N
1380	1	1923	\N
1381	1	1893	\N
1382	1	1924	\N
1383	1	1925	\N
1384	1	1926	\N
1385	1	1927	\N
1386	1	1928	\N
1387	1	1929	\N
1388	1	1930	\N
1389	1	1931	\N
1390	1	1933	\N
1391	1	1934	\N
1392	1	1935	\N
1393	1	1936	\N
1394	1	1937	\N
1395	1	1938	\N
1396	1	1939	\N
1397	1	1940	\N
1398	1	1942	\N
1399	1	1943	\N
1400	1	1944	\N
1401	1	1945	\N
1402	1	1946	\N
1403	1	1947	\N
1404	1	1948	\N
1405	1	1949	\N
1406	1	1951	\N
1407	1	1952	\N
1408	1	1953	\N
1409	1	1954	\N
1410	1	1955	\N
1411	1	1956	\N
1412	1	1957	\N
1413	1	1958	\N
1414	1	1960	\N
1415	1	1961	\N
1416	1	1962	\N
1417	1	1963	\N
1418	1	1964	\N
1419	1	1965	\N
1420	1	1966	\N
1421	1	1967	\N
1422	1	1968	\N
1423	1	1969	\N
1424	1	1970	\N
1425	1	1971	\N
1426	1	1972	\N
1427	1	1973	\N
1428	1	1974	\N
1429	1	1975	\N
1430	1	1976	\N
1431	1	1932	\N
1432	1	1978	\N
1433	1	1979	\N
1434	1	1980	\N
1435	1	1981	\N
1436	1	1982	\N
1437	1	1983	\N
1438	1	1984	\N
1439	1	1985	\N
1440	1	1986	\N
1441	1	1987	\N
1442	1	1988	\N
1443	1	1989	\N
1444	1	1990	\N
1445	1	1991	\N
1446	1	1992	\N
1447	1	1993	\N
1448	1	1994	\N
1449	1	1995	\N
1450	1	1996	\N
1451	1	1997	\N
1452	1	1998	\N
1453	1	1999	\N
1454	1	2000	\N
1455	1	2001	\N
1456	1	2002	\N
1457	1	2003	\N
1458	1	2005	\N
1459	1	2006	\N
1460	1	2007	\N
1461	1	2008	\N
1462	1	2009	\N
1463	1	2010	\N
1464	1	2011	\N
1465	1	2012	\N
1466	1	2013	\N
1467	1	2014	\N
1468	1	2015	\N
1469	1	2016	\N
1470	1	2017	\N
1471	1	2018	\N
1472	1	2019	\N
1473	1	2021	\N
1474	1	2022	\N
1475	1	2023	\N
1476	1	2024	\N
1477	1	2025	\N
1478	1	2026	\N
1479	1	2027	\N
1480	1	2028	\N
1481	1	2020	\N
1482	1	2030	\N
1483	1	2031	\N
1484	1	2032	\N
1485	1	2033	\N
1486	1	2034	\N
1487	1	2035	\N
1488	1	2036	\N
1489	1	2037	\N
1490	1	2039	\N
1491	1	2040	\N
1492	1	2041	\N
1493	1	2042	\N
1494	1	2043	\N
1495	1	2044	\N
1496	1	2045	\N
1497	1	2046	\N
1498	1	2048	\N
1499	1	2049	\N
1500	1	2050	\N
1501	1	2051	\N
1502	1	2052	\N
1503	1	2053	\N
1504	1	2054	\N
1505	1	2055	\N
1506	1	2057	\N
1507	1	2058	\N
1508	1	2059	\N
1509	1	2060	\N
1510	1	2061	\N
1511	1	2062	\N
1512	1	2063	\N
1513	1	2064	\N
1514	1	2065	\N
1515	1	2066	\N
1516	1	2067	\N
1517	1	2068	\N
1518	1	2069	\N
1519	1	2070	\N
1520	1	2071	\N
1521	1	2072	\N
1522	1	2038	\N
1523	1	2073	\N
1524	1	2074	\N
1525	1	2075	\N
1526	1	2076	\N
1527	1	2077	\N
1528	1	2078	\N
1529	1	2079	\N
1530	1	2080	\N
1531	1	2082	\N
1532	1	2083	\N
1533	1	2084	\N
1534	1	2085	\N
1535	1	2086	\N
1536	1	2087	\N
1537	1	2088	\N
1538	1	2089	\N
1539	1	2047	\N
1540	1	2081	\N
1541	1	587	\N
1542	1	618	\N
1543	1	708	\N
1544	1	1328	\N
1545	1	2090	\N
1546	1	2091	\N
1547	1	2092	\N
1548	1	2093	\N
1549	1	2094	\N
1550	1	2095	\N
1551	1	2096	\N
1552	1	2097	\N
1553	1	2099	\N
1554	1	2100	\N
1555	1	2101	\N
1556	1	2102	\N
1557	1	2103	\N
1558	1	2104	\N
1559	1	2105	\N
1560	1	2106	\N
1561	1	2107	\N
1562	1	2108	\N
1563	1	2109	\N
1564	1	2110	\N
1565	1	2111	\N
1566	1	2112	\N
1567	1	2113	\N
1568	1	2114	\N
1569	1	2116	\N
1570	1	2117	\N
1571	1	2118	\N
1572	1	2119	\N
1573	1	2120	\N
1574	1	2121	\N
1575	1	2122	\N
1576	1	2123	\N
1577	1	2124	\N
1578	1	2125	\N
1579	1	2126	\N
1580	1	2127	\N
1581	1	2128	\N
1582	1	2129	\N
1583	1	2130	\N
1584	1	2131	\N
1585	1	2132	\N
1586	1	2133	\N
1587	1	2134	\N
1588	1	2135	\N
1589	1	2136	\N
1590	1	2137	\N
1591	1	2138	\N
1592	1	2139	\N
1593	1	2140	\N
1594	1	2141	\N
1595	1	2143	\N
1596	1	2144	\N
1597	1	2145	\N
1598	1	2146	\N
1599	1	2147	\N
1600	1	2148	\N
1601	1	2149	\N
1602	1	2150	\N
1603	1	2151	\N
1604	1	2152	\N
1605	1	2153	\N
1606	1	2154	\N
1607	1	2155	\N
1608	1	2156	\N
1609	1	2157	\N
1610	1	2158	\N
1611	1	2142	\N
1612	1	2159	\N
1613	1	2160	\N
1614	1	2161	\N
1615	1	2162	\N
1616	1	2163	\N
1617	1	2164	\N
1618	1	2165	\N
1619	1	2166	\N
1620	1	2167	\N
1621	1	2168	\N
1622	1	2169	\N
1623	1	2170	\N
1624	1	2171	\N
1625	1	2172	\N
1626	1	2173	\N
1627	1	2174	\N
1628	1	2175	\N
1629	1	2176	\N
1630	1	2177	\N
1631	1	2178	\N
1632	1	2179	\N
1633	1	2180	\N
1634	1	2181	\N
1635	1	2182	\N
1636	1	2183	\N
1637	1	2184	\N
1638	1	2185	\N
1639	1	2186	\N
1640	1	2187	\N
1641	1	2188	\N
1642	1	2189	\N
1643	1	2191	\N
1644	1	2192	\N
1645	1	2193	\N
1646	1	2194	\N
1647	1	2195	\N
1648	1	2196	\N
1649	1	2197	\N
1650	1	2198	\N
1651	1	2199	\N
1652	1	2200	\N
1653	1	2201	\N
1654	1	2202	\N
1655	1	2203	\N
1656	1	2204	\N
1657	1	2205	\N
1658	1	2206	\N
1659	1	2207	\N
1660	1	2208	\N
1661	1	2209	\N
1662	1	2210	\N
1663	1	2211	\N
1664	1	2212	\N
1665	1	2213	\N
1666	1	2214	\N
1667	1	2190	\N
1668	1	2215	\N
1669	1	2216	\N
1670	1	2217	\N
1671	1	2218	\N
1672	1	2219	\N
1673	1	2220	\N
1674	1	2221	\N
1675	1	2222	\N
1676	1	2223	\N
1677	1	2098	\N
1678	1	2224	\N
1679	1	2225	\N
1680	1	2226	\N
1681	1	2227	\N
1682	1	2228	\N
1683	1	2229	\N
1684	1	2230	\N
1685	1	2231	\N
1686	1	2232	\N
1687	1	2233	\N
1688	1	2234	\N
1689	1	2235	\N
1690	1	2236	\N
1691	1	2237	\N
1692	1	2238	\N
1693	1	2239	\N
1694	1	2240	\N
1695	1	2241	\N
1696	1	2242	\N
1697	1	2244	\N
1698	1	2245	\N
1699	1	2246	\N
1700	1	2247	\N
1701	1	2248	\N
1702	1	2249	\N
1703	1	2250	\N
1704	1	2251	\N
1705	1	2253	\N
1706	1	2254	\N
1707	1	2255	\N
1708	1	2256	\N
1709	1	2257	\N
1710	1	2258	\N
1711	1	2259	\N
1712	1	2260	\N
1713	1	2261	\N
1714	1	2262	\N
1715	1	2263	\N
1716	1	2264	\N
1717	1	2265	\N
1718	1	2266	\N
1719	1	2267	\N
1720	1	2268	\N
1721	1	2269	\N
1722	1	2270	\N
1723	1	2271	\N
1724	1	2273	\N
1725	1	2274	\N
1726	1	2275	\N
1727	1	2276	\N
1728	1	2277	\N
1729	1	2278	\N
1730	1	2279	\N
1731	1	2280	\N
1732	1	2281	\N
1733	1	2282	\N
1734	1	2283	\N
1735	1	2284	\N
1736	1	2285	\N
1737	1	2286	\N
1738	1	2287	\N
1739	1	2288	\N
1740	1	2289	\N
1741	1	2290	\N
1742	1	2291	\N
1743	1	2292	\N
1744	1	2293	\N
1745	1	2294	\N
1746	1	2295	\N
1747	1	2296	\N
1748	1	2297	\N
1749	1	2298	\N
1750	1	2299	\N
1751	1	2300	\N
1752	1	2302	\N
1753	1	2303	\N
1754	1	2304	\N
1755	1	2305	\N
1756	1	2306	\N
1757	1	2307	\N
1758	1	2308	\N
1759	1	2309	\N
1760	1	2310	\N
1761	1	2312	\N
1762	1	2313	\N
1763	1	2314	\N
1764	1	2315	\N
1765	1	2316	\N
1766	1	2317	\N
1767	1	2318	\N
1768	1	2319	\N
1769	1	2320	\N
1770	1	2322	\N
1771	1	2323	\N
1772	1	2324	\N
1773	1	2325	\N
1774	1	1	\N
1775	1	2	\N
1776	1	5344	\N
1777	1	3	\N
1778	1	2326	\N
1779	1	2327	\N
1780	1	2328	\N
1781	1	2329	\N
1782	1	2330	\N
1783	1	2331	\N
1784	1	2332	\N
1785	1	2333	\N
1786	1	2334	\N
1787	1	2335	\N
1788	1	2336	\N
1789	1	2337	\N
1790	1	2338	\N
1791	1	2339	\N
1792	1	2340	\N
1793	1	2341	\N
1794	1	2311	\N
1795	1	2342	\N
1796	1	2343	\N
1797	1	2344	\N
1798	1	2345	\N
1799	1	2346	\N
1800	1	2347	\N
1801	1	2348	\N
1802	1	2349	\N
1803	1	2350	\N
1804	1	2352	\N
1805	1	2353	\N
1806	1	2354	\N
1807	1	2355	\N
1808	1	2356	\N
1809	1	2357	\N
1810	1	2358	\N
1811	1	2359	\N
1812	1	2360	\N
1813	1	2361	\N
1814	1	1950	\N
1815	1	2362	\N
1816	1	2363	\N
1817	1	2364	\N
1818	1	2365	\N
1819	1	5345	\N
1820	1	4	\N
1821	1	2366	\N
1822	1	2367	\N
1823	1	2368	\N
1824	1	2369	\N
1825	1	5380	\N
1826	1	5381	\N
1827	1	5382	\N
1828	1	5	\N
1829	1	2370	\N
1830	1	2371	\N
1831	1	2372	\N
1832	1	2373	\N
1833	1	2374	\N
1834	1	2375	\N
1835	1	2376	\N
1836	1	2377	\N
1837	1	2378	\N
1838	1	2379	\N
1839	1	2380	\N
1840	1	2382	\N
1841	1	2383	\N
1842	1	2384	\N
1843	1	2385	\N
1844	1	2386	\N
1845	1	2387	\N
1846	1	2388	\N
1847	1	2389	\N
1848	1	2390	\N
1849	1	1959	\N
1850	1	1977	\N
1851	1	2392	\N
1852	1	2393	\N
1853	1	2394	\N
1854	1	2395	\N
1855	1	2396	\N
1856	1	2397	\N
1857	1	2398	\N
1858	1	2399	\N
1859	1	2400	\N
1860	1	2401	\N
1861	1	2402	\N
1862	1	2403	\N
1863	1	2404	\N
1864	1	2405	\N
1865	1	5346	\N
1866	1	6	\N
1867	1	7	\N
1868	1	8	\N
1869	1	9	\N
1870	1	10	\N
1871	1	11	\N
1872	1	12	\N
1873	1	13	\N
1874	1	14	\N
1875	1	15	\N
1876	1	16	\N
1877	1	17	\N
1878	1	18	\N
1879	1	19	\N
1880	1	20	\N
1881	1	21	\N
1882	1	22	\N
1883	1	23	\N
1884	1	24	\N
1885	1	25	\N
1886	1	26	\N
1887	1	27	\N
1888	1	28	\N
1889	1	29	\N
1890	1	2406	\N
1891	1	30	\N
1892	1	31	\N
1893	1	32	\N
1894	1	33	\N
1895	1	34	\N
1896	1	35	\N
1897	1	36	\N
1898	1	37	\N
1899	1	38	\N
1900	1	39	\N
1901	1	2407	\N
1902	1	2408	\N
1903	1	5347	\N
1904	1	40	\N
1905	1	41	\N
1906	1	42	\N
1907	1	43	\N
1908	1	44	\N
1909	1	45	\N
1910	1	46	\N
1911	1	2409	\N
1912	1	2410	\N
1913	1	2411	\N
1914	1	2412	\N
1915	1	47	\N
1916	1	48	\N
1917	1	49	\N
1918	1	50	\N
1919	1	2413	\N
1920	1	2414	\N
1921	1	2415	\N
1922	1	2416	\N
1923	1	2417	\N
1924	1	2418	\N
1925	1	2419	\N
1926	1	2420	\N
1927	1	2421	\N
1928	1	5348	\N
1929	1	51	\N
1930	1	5349	\N
1931	1	52	\N
1932	1	2422	\N
1933	1	2423	\N
1934	1	2424	\N
1935	1	2425	\N
1936	1	2426	\N
1937	1	2427	\N
1938	1	2428	\N
1939	1	2429	\N
1940	1	5383	\N
1941	1	5384	\N
1942	1	5385	\N
1943	1	5386	\N
1944	1	53	\N
1945	1	54	\N
1946	1	55	\N
1947	1	56	\N
1948	1	57	\N
1949	1	58	\N
1950	1	59	\N
1951	1	60	\N
1952	1	61	\N
1953	1	62	\N
1954	1	63	\N
1955	1	64	\N
1956	1	65	\N
1957	1	66	\N
1958	1	67	\N
1959	1	68	\N
1960	1	69	\N
1961	1	70	\N
1962	1	71	\N
1963	1	72	\N
1964	1	73	\N
1965	1	74	\N
1966	1	75	\N
1967	1	76	\N
1968	1	77	\N
1969	1	78	\N
1970	1	79	\N
1971	1	80	\N
1972	1	81	\N
1973	1	82	\N
1974	1	83	\N
1975	1	84	\N
1976	1	85	\N
1977	1	86	\N
1978	1	87	\N
1979	1	88	\N
1980	1	89	\N
1981	1	90	\N
1982	1	91	\N
1983	1	92	\N
1984	1	93	\N
1985	1	94	\N
1986	1	95	\N
1987	1	96	\N
1988	1	97	\N
1989	1	98	\N
1990	1	99	\N
1991	1	100	\N
1992	1	101	\N
1993	1	102	\N
1994	1	103	\N
1995	1	104	\N
1996	1	105	\N
1997	1	106	\N
1998	1	107	\N
1999	1	108	\N
2000	1	109	\N
2001	1	110	\N
2002	1	111	\N
2003	1	112	\N
2004	1	113	\N
2005	1	114	\N
2006	1	115	\N
2007	1	116	\N
2008	1	117	\N
2009	1	118	\N
2010	1	119	\N
2011	1	120	\N
2012	1	121	\N
2013	1	122	\N
2014	1	123	\N
2015	1	124	\N
2016	1	125	\N
2017	1	126	\N
2018	1	127	\N
2019	1	128	\N
2020	1	129	\N
2021	1	130	\N
2022	1	131	\N
2023	1	132	\N
2024	1	133	\N
2025	1	134	\N
2026	1	135	\N
2027	1	136	\N
2028	1	137	\N
2029	1	138	\N
2030	1	139	\N
2031	1	140	\N
2032	1	141	\N
2033	1	142	\N
2034	1	143	\N
2035	1	144	\N
2036	1	145	\N
2037	1	146	\N
2038	1	2430	\N
2039	1	147	\N
2040	1	148	\N
2041	1	149	\N
2042	1	150	\N
2043	1	151	\N
2044	1	152	\N
2045	1	153	\N
2046	1	154	\N
2047	1	155	\N
2048	1	156	\N
2049	1	157	\N
2050	1	158	\N
2051	1	159	\N
2052	1	160	\N
2053	1	161	\N
2054	1	162	\N
2055	1	163	\N
2056	1	164	\N
2057	1	165	\N
2058	1	166	\N
2059	1	167	\N
2060	1	168	\N
2061	1	169	\N
2062	1	170	\N
2063	1	171	\N
2064	1	172	\N
2065	1	173	\N
2066	1	174	\N
2067	1	175	\N
2068	1	176	\N
2069	1	177	\N
2070	1	178	\N
2071	1	179	\N
2072	1	180	\N
2073	1	181	\N
2074	1	182	\N
2075	1	183	\N
2076	1	184	\N
2077	1	185	\N
2078	1	186	\N
2079	1	187	\N
2080	1	188	\N
2081	1	189	\N
2082	1	190	\N
2083	1	191	\N
2084	1	192	\N
2085	1	193	\N
2086	1	194	\N
2087	1	195	\N
2088	1	196	\N
2089	1	197	\N
2090	1	198	\N
2091	1	199	\N
2092	1	200	\N
2093	1	201	\N
2094	1	202	\N
2095	1	203	\N
2096	1	204	\N
2097	1	205	\N
2098	1	206	\N
2099	1	207	\N
2100	1	208	\N
2101	1	209	\N
2102	1	210	\N
2103	1	211	\N
2104	1	212	\N
2105	1	213	\N
2106	1	214	\N
2107	1	215	\N
2108	1	216	\N
2109	1	217	\N
2110	1	218	\N
2111	1	219	\N
2112	1	220	\N
2113	1	221	\N
2114	1	222	\N
2115	1	223	\N
2116	1	224	\N
2117	1	225	\N
2118	1	226	\N
2119	1	227	\N
2120	1	228	\N
2121	1	229	\N
2122	1	230	\N
2123	1	231	\N
2124	1	232	\N
2125	1	233	\N
2126	1	234	\N
2127	1	235	\N
2128	1	236	\N
2129	1	237	\N
2130	1	238	\N
2131	1	239	\N
2132	1	240	\N
2133	1	241	\N
2134	1	242	\N
2135	1	244	\N
2136	1	245	\N
2137	1	246	\N
2138	1	247	\N
2139	1	248	\N
2140	1	249	\N
2141	1	250	\N
2142	1	5350	\N
2143	1	5351	\N
2144	1	5352	\N
2145	1	5353	\N
2146	1	4730	\N
2147	1	4740	\N
2148	1	4770	\N
2149	1	4829	\N
2150	1	4865	\N
2151	1	4893	\N
2152	1	4913	\N
2153	1	4923	\N
2154	1	5000	\N
2155	1	5011	\N
2156	1	5022	\N
2157	1	5033	\N
2158	1	5044	\N
2159	1	5236	\N
2160	1	5248	\N
2161	1	5260	\N
2162	1	537	\N
2163	1	567	\N
2164	1	577	\N
2165	1	608	\N
2166	1	628	\N
2167	1	638	\N
2168	1	658	\N
2169	1	678	\N
2170	1	698	\N
2171	1	746	\N
2172	1	764	\N
2173	1	783	\N
2174	1	829	\N
2175	1	1319	\N
2176	1	1364	\N
2177	1	1381	\N
2178	1	2431	\N
2179	1	2432	\N
2180	1	2433	\N
2181	1	2434	\N
2182	1	2435	\N
2183	1	2436	\N
2184	1	2437	\N
2185	1	2438	\N
2186	1	2439	\N
2187	1	2440	\N
2188	1	2441	\N
2189	1	2442	\N
2190	1	2443	\N
2191	1	2444	\N
2192	1	2445	\N
2193	1	2446	\N
2194	1	2447	\N
2195	1	2448	\N
2196	1	2449	\N
2197	1	2450	\N
2198	1	2451	\N
2199	1	2452	\N
2200	1	2453	\N
2201	1	2454	\N
2202	1	2455	\N
2203	1	2456	\N
2204	1	2457	\N
2205	1	2458	\N
2206	1	2459	\N
2207	1	2460	\N
2208	1	2461	\N
2209	1	2462	\N
2210	1	2463	\N
2211	1	2464	\N
2212	1	2465	\N
2213	1	2466	\N
2214	1	2467	\N
2215	1	2468	\N
2216	1	2469	\N
2217	1	2470	\N
2218	1	2471	\N
2219	1	2472	\N
2220	1	2473	\N
2221	1	2474	\N
2222	1	2475	\N
2223	1	2476	\N
2224	1	2477	\N
2225	1	2478	\N
2226	1	2480	\N
2227	1	2481	\N
2228	1	2482	\N
2229	1	251	\N
2230	1	1415	\N
2231	1	2483	\N
2232	1	1495	\N
2233	1	252	\N
2234	1	2484	\N
2235	1	1535	\N
2236	1	2485	\N
2237	1	253	\N
2238	1	1631	\N
2239	1	1642	\N
2240	1	254	\N
2241	1	2486	\N
2242	1	2487	\N
2243	1	2488	\N
2244	1	2489	\N
2245	1	2490	\N
2246	1	2491	\N
2247	1	255	\N
2248	1	2492	\N
2249	1	2493	\N
2250	1	2494	\N
2251	1	2495	\N
2252	1	2496	\N
2253	1	2497	\N
2254	1	2498	\N
2255	1	2499	\N
2256	1	2500	\N
2257	1	2301	\N
2258	1	2381	\N
2259	1	1652	\N
2260	1	1785	\N
2261	1	2501	\N
2262	1	2502	\N
2263	1	2503	\N
2264	1	2504	\N
2265	1	2505	\N
2266	1	2506	\N
2267	1	2507	\N
2268	1	2508	\N
2269	1	2509	\N
2270	1	2510	\N
2271	1	2511	\N
2272	1	2512	\N
2273	1	2513	\N
2274	1	2514	\N
2275	1	2515	\N
2276	1	2516	\N
2277	1	2517	\N
2278	1	2518	\N
2279	1	2519	\N
2280	1	2520	\N
2281	1	2521	\N
2282	1	2523	\N
2283	1	2524	\N
2284	1	2525	\N
2285	1	2526	\N
2286	1	2527	\N
2287	1	2528	\N
2288	1	2529	\N
2289	1	2530	\N
2290	1	2531	\N
2291	1	2532	\N
2292	1	2522	\N
2293	1	2534	\N
2294	1	2535	\N
2295	1	2536	\N
2296	1	2537	\N
2297	1	2538	\N
2298	1	2539	\N
2299	1	2540	\N
2300	1	2541	\N
2301	1	2542	\N
2302	1	2543	\N
2303	1	2544	\N
2304	1	2545	\N
2305	1	2546	\N
2306	1	2547	\N
2307	1	2548	\N
2308	1	2549	\N
2309	1	2550	\N
2310	1	2551	\N
2311	1	2552	\N
2312	1	256	\N
2313	1	1671	\N
2314	1	257	\N
2315	1	2553	\N
2316	1	2554	\N
2317	1	2555	\N
2318	1	1824	\N
2319	1	2321	\N
2320	1	2556	\N
2321	1	2557	\N
2322	1	2558	\N
2323	1	2559	\N
2324	1	2560	\N
2325	1	2561	\N
2326	1	2562	\N
2327	1	2563	\N
2328	1	2564	\N
2329	1	2565	\N
2330	1	2566	\N
2331	1	2567	\N
2332	1	2568	\N
2333	1	2569	\N
2334	1	2570	\N
2335	1	2571	\N
2336	1	2572	\N
2337	1	2573	\N
2338	1	258	\N
2339	1	259	\N
2340	1	260	\N
2341	1	261	\N
2342	1	262	\N
2343	1	243	\N
2344	1	263	\N
2345	1	264	\N
2346	1	265	\N
2347	1	266	\N
2348	1	267	\N
2349	1	268	\N
2350	1	269	\N
2351	1	270	\N
2352	1	271	\N
2353	1	272	\N
2354	1	273	\N
2355	1	274	\N
2356	1	275	\N
2357	1	276	\N
2358	1	277	\N
2359	1	278	\N
2360	1	279	\N
2361	1	280	\N
2362	1	281	\N
2363	1	282	\N
2364	1	283	\N
2365	1	284	\N
2366	1	285	\N
2367	1	286	\N
2368	1	287	\N
2369	1	288	\N
2370	1	289	\N
2371	1	290	\N
2372	1	291	\N
2373	1	292	\N
2374	1	293	\N
2375	1	294	\N
2376	1	295	\N
2377	1	296	\N
2378	1	297	\N
2379	1	298	\N
2380	1	299	\N
2381	1	301	\N
2382	1	302	\N
2383	1	303	\N
2384	1	304	\N
2385	1	2574	\N
2386	1	2575	\N
2387	1	2576	\N
2388	1	2577	\N
2389	1	2578	\N
2390	1	2579	\N
2391	1	305	\N
2392	1	306	\N
2393	1	307	\N
2394	1	308	\N
2395	1	309	\N
2396	1	310	\N
2397	1	311	\N
2398	1	312	\N
2399	1	313	\N
2400	1	314	\N
2401	1	315	\N
2402	1	316	\N
2403	1	317	\N
2404	1	318	\N
2405	1	300	\N
2406	1	320	\N
2407	1	321	\N
2408	1	322	\N
2409	1	323	\N
2410	1	324	\N
2411	1	325	\N
2412	1	326	\N
2413	1	327	\N
2414	1	328	\N
2415	1	329	\N
2416	1	330	\N
2417	1	331	\N
2418	1	332	\N
2419	1	333	\N
2420	1	334	\N
2421	1	335	\N
2422	1	336	\N
2423	1	337	\N
2424	1	339	\N
2425	1	340	\N
2426	1	341	\N
2427	1	342	\N
2428	1	343	\N
2429	1	344	\N
2430	1	345	\N
2431	1	346	\N
2432	1	347	\N
2433	1	348	\N
2434	1	349	\N
2435	1	350	\N
2436	1	351	\N
2437	1	352	\N
2438	1	353	\N
2439	1	354	\N
2440	1	355	\N
2441	1	356	\N
2442	1	357	\N
2443	1	358	\N
2444	1	359	\N
2445	1	360	\N
2446	1	361	\N
2447	1	362	\N
2448	1	363	\N
2449	1	364	\N
2450	1	365	\N
2451	1	366	\N
2452	1	367	\N
2453	1	368	\N
2454	1	369	\N
2455	1	370	\N
2456	1	371	\N
2457	1	372	\N
2458	1	373	\N
2459	1	374	\N
2460	1	375	\N
2461	1	376	\N
2462	1	377	\N
2463	1	378	\N
2464	1	379	\N
2465	1	380	\N
2466	1	381	\N
2467	1	382	\N
2468	1	383	\N
2469	1	384	\N
2470	1	385	\N
2471	1	386	\N
2472	1	387	\N
2473	1	388	\N
2474	1	389	\N
2475	1	390	\N
2476	1	391	\N
2477	1	392	\N
2478	1	393	\N
2479	1	394	\N
2480	1	319	\N
2481	1	395	\N
2482	1	396	\N
2483	1	397	\N
2484	1	398	\N
2485	1	399	\N
2486	1	400	\N
2487	1	401	\N
2488	1	402	\N
2489	1	403	\N
2490	1	404	\N
2491	1	405	\N
2492	1	406	\N
2493	1	407	\N
2494	1	408	\N
2495	1	409	\N
2496	1	410	\N
2497	1	411	\N
2498	1	412	\N
2499	1	413	\N
2500	1	2580	\N
2501	1	2581	\N
2502	1	2582	\N
2503	1	2583	\N
2504	1	2584	\N
2505	1	2585	\N
2506	1	2586	\N
2507	1	2587	\N
2508	1	2588	\N
2509	1	2589	\N
2510	1	2590	\N
2511	1	2591	\N
2512	1	2592	\N
2513	1	2593	\N
2514	1	2594	\N
2515	1	2595	\N
2516	1	2596	\N
2517	1	2597	\N
2518	1	2598	\N
2519	1	2599	\N
2520	1	2600	\N
2521	1	2601	\N
2522	1	2602	\N
2523	1	2603	\N
2524	1	2604	\N
2525	1	2605	\N
2526	1	2606	\N
2527	1	2607	\N
2528	1	2608	\N
2529	1	2609	\N
2530	1	2610	\N
2531	1	2611	\N
2532	1	2612	\N
2533	1	2613	\N
2534	1	2614	\N
2535	1	414	\N
2536	1	415	\N
2537	1	416	\N
2538	1	417	\N
2539	1	418	\N
2540	1	419	\N
2541	1	420	\N
2542	1	421	\N
2543	1	422	\N
2544	1	423	\N
2545	1	424	\N
2546	1	2615	\N
2547	1	425	\N
2548	1	426	\N
2549	1	427	\N
2550	1	428	\N
2551	1	429	\N
2552	1	430	\N
2553	1	432	\N
2554	1	433	\N
2555	1	434	\N
2556	1	2616	\N
2557	1	435	\N
2558	1	436	\N
2559	1	2617	\N
2560	1	2618	\N
2561	1	2619	\N
2562	1	2620	\N
2563	1	2622	\N
2564	1	2623	\N
2565	1	2624	\N
2566	1	2625	\N
2567	1	2626	\N
2568	1	2627	\N
2569	1	2628	\N
2570	1	2629	\N
2571	1	2630	\N
2572	1	2631	\N
2573	1	2632	\N
2574	1	2633	\N
2575	1	2634	\N
2576	1	2635	\N
2577	1	2636	\N
2578	1	2637	\N
2579	1	2638	\N
2580	1	2639	\N
2581	1	2640	\N
2582	1	2641	\N
2583	1	2642	\N
2584	1	2643	\N
2585	1	2644	\N
2586	1	2645	\N
2587	1	1681	\N
2588	1	1692	\N
2589	1	1702	\N
2590	1	1712	\N
2591	1	1844	\N
2592	1	1854	\N
2593	1	1873	\N
2594	1	1941	\N
2595	1	2004	\N
2596	1	2029	\N
2597	1	437	\N
2598	1	438	\N
2599	1	439	\N
2600	1	440	\N
2601	1	2056	\N
2602	1	2115	\N
2603	1	2243	\N
2604	1	2252	\N
2605	1	2272	\N
2606	1	2351	\N
2607	1	2391	\N
2608	1	2479	\N
2609	1	2533	\N
2610	1	2621	\N
2611	1	2722	\N
2612	1	2742	\N
2613	1	2752	\N
2614	1	2782	\N
2615	1	2801	\N
2616	1	2871	\N
2617	1	2881	\N
2618	1	2921	\N
2619	1	2931	\N
2620	1	2940	\N
2621	1	2949	\N
2622	1	3000	\N
2623	1	3029	\N
2624	1	3049	\N
2625	1	3069	\N
2626	1	3088	\N
2627	1	3097	\N
2628	1	3124	\N
2629	1	3142	\N
2630	1	3151	\N
2631	1	3178	\N
2632	1	3206	\N
2633	1	3216	\N
2634	1	3261	\N
2635	1	3270	\N
2636	1	3288	\N
2637	1	3404	\N
2638	1	3442	\N
2639	1	3461	\N
2640	1	3508	\N
2641	1	3527	\N
2642	1	3537	\N
2643	1	3547	\N
2644	1	3557	\N
2645	1	3567	\N
2646	1	3577	\N
2647	1	3587	\N
2648	1	3607	\N
2649	1	3617	\N
2650	1	3719	\N
2651	1	3728	\N
2652	1	3737	\N
2653	1	3746	\N
2654	1	441	\N
2655	1	2646	\N
2656	1	2647	\N
2657	1	2648	\N
2658	1	2649	\N
2659	1	2650	\N
2660	1	2651	\N
2661	1	2652	\N
2662	1	2653	\N
2663	1	2654	\N
2664	1	2655	\N
2665	1	2656	\N
2666	1	2657	\N
2667	1	2658	\N
2668	1	2659	\N
2669	1	2660	\N
2670	1	2661	\N
2671	1	2662	\N
2672	1	2663	\N
2673	1	2664	\N
2674	1	2665	\N
2675	1	2666	\N
2676	1	2667	\N
2677	1	2668	\N
2678	1	2669	\N
2679	1	2670	\N
2680	1	2671	\N
2681	1	2672	\N
2682	1	2673	\N
2683	1	2674	\N
2684	1	2675	\N
2685	1	2676	\N
2686	1	2677	\N
2687	1	2678	\N
2688	1	2679	\N
2689	1	2680	\N
2690	1	2681	\N
2691	1	2682	\N
2692	1	442	\N
2693	1	2683	\N
2694	1	2684	\N
2695	1	2685	\N
2696	1	2686	\N
2697	1	2687	\N
2698	1	2688	\N
2699	1	2689	\N
2700	1	2690	\N
2701	1	2691	\N
2702	1	2693	\N
2703	1	2694	\N
2704	1	2695	\N
2705	1	2696	\N
2706	1	2697	\N
2707	1	2698	\N
2708	1	2699	\N
2709	1	2700	\N
2710	1	2701	\N
2711	1	2702	\N
2712	1	2703	\N
2713	1	2704	\N
2714	1	2705	\N
2715	1	2706	\N
2716	1	2707	\N
2717	1	443	\N
2718	1	444	\N
2719	1	445	\N
2720	1	2708	\N
2721	1	2709	\N
2722	1	2710	\N
2723	1	3755	\N
2724	1	446	\N
2725	1	2711	\N
2726	1	3764	\N
2727	1	447	\N
2728	1	2712	\N
2729	1	2713	\N
2730	1	2714	\N
2731	1	2715	\N
2732	1	2716	\N
2733	1	2717	\N
2734	1	2718	\N
2735	1	3773	\N
2736	1	448	\N
2737	1	2719	\N
2738	1	2720	\N
2739	1	2721	\N
2740	1	2723	\N
2741	1	2724	\N
2742	1	2725	\N
2743	1	2726	\N
2744	1	2727	\N
2745	1	2728	\N
2746	1	2729	\N
2747	1	2730	\N
2748	1	2731	\N
2749	1	2732	\N
2750	1	2733	\N
2751	1	2734	\N
2752	1	2735	\N
2753	1	2736	\N
2754	1	2737	\N
2755	1	2738	\N
2756	1	2739	\N
2757	1	2740	\N
2758	1	2741	\N
2759	1	2743	\N
2760	1	2744	\N
2761	1	2745	\N
2762	1	2746	\N
2763	1	2747	\N
2764	1	2748	\N
2765	1	2749	\N
2766	1	5387	\N
2767	1	2750	\N
2768	1	2751	\N
2769	1	3802	\N
2770	1	449	\N
2771	1	2753	\N
2772	1	2754	\N
2773	1	2755	\N
2774	1	2756	\N
2775	1	3813	\N
2776	1	2757	\N
2777	1	450	\N
2778	1	3824	\N
2779	1	2758	\N
2780	1	2759	\N
2781	1	2760	\N
2782	1	2761	\N
2783	1	2762	\N
2784	1	2763	\N
2785	1	2764	\N
2786	1	4062	\N
2787	1	451	\N
2788	1	2765	\N
2789	1	2766	\N
2790	1	2767	\N
2791	1	4180	\N
2792	1	452	\N
2793	1	2768	\N
2794	1	2769	\N
2795	1	4220	\N
2796	1	453	\N
2797	1	2770	\N
2798	1	4271	\N
2799	1	4290	\N
2800	1	454	\N
2801	1	455	\N
2802	1	4344	\N
2803	1	456	\N
2804	1	2771	\N
2805	1	2772	\N
2806	1	2773	\N
2807	1	2774	\N
2808	1	2775	\N
2809	1	4353	\N
2810	1	457	\N
2811	1	2776	\N
2812	1	458	\N
2813	1	2777	\N
2814	1	2778	\N
2815	1	2779	\N
2816	1	2780	\N
2817	1	2781	\N
2818	1	2783	\N
2819	1	2784	\N
2820	1	2785	\N
2821	1	459	\N
2822	1	2786	\N
2823	1	460	\N
2824	1	2787	\N
2825	1	2788	\N
2826	1	2789	\N
2827	1	2790	\N
2828	1	2791	\N
2829	1	2792	\N
2830	1	4362	\N
2831	1	461	\N
2832	1	2793	\N
2833	1	5388	\N
2834	1	5389	\N
2835	1	5390	\N
2836	1	2794	\N
2837	1	2795	\N
2838	1	2796	\N
2839	1	2797	\N
2840	1	2798	\N
2841	1	2799	\N
2842	1	462	\N
2843	1	463	\N
2844	1	2800	\N
2845	1	2802	\N
2846	1	2803	\N
2847	1	2804	\N
2848	1	2805	\N
2849	1	2806	\N
2850	1	2807	\N
2851	1	2808	\N
2852	1	2809	\N
2853	1	2810	\N
2854	1	4379	\N
2855	1	464	\N
2856	1	2811	\N
2857	1	2812	\N
2858	1	2813	\N
2859	1	5391	\N
2860	1	5392	\N
2861	1	5393	\N
2862	1	4495	\N
2863	1	2814	\N
2864	1	465	\N
2865	1	2815	\N
2866	1	2816	\N
2867	1	2817	\N
2868	1	2818	\N
2869	1	2819	\N
2870	1	2820	\N
2871	1	2821	\N
2872	1	2822	\N
2873	1	2823	\N
2874	1	2824	\N
2875	1	2825	\N
2876	1	2826	\N
2877	1	2827	\N
2878	1	2828	\N
2879	1	2829	\N
2880	1	2830	\N
2881	1	2831	\N
2882	1	2832	\N
2883	1	2833	\N
2884	1	2834	\N
2885	1	2835	\N
2886	1	2836	\N
2887	1	2837	\N
2888	1	2838	\N
2889	1	4505	\N
2890	1	466	\N
2891	1	2839	\N
2892	1	5394	\N
2893	1	2840	\N
2894	1	2842	\N
2895	1	2843	\N
2896	1	2844	\N
2897	1	5395	\N
2898	1	2845	\N
2899	1	2846	\N
2900	1	2847	\N
2901	1	2848	\N
2902	1	2849	\N
2903	1	2850	\N
2904	1	2851	\N
2905	1	2852	\N
2906	1	2853	\N
2907	1	2854	\N
2908	1	2855	\N
2909	1	2856	\N
2910	1	2857	\N
2911	1	2858	\N
2912	1	2859	\N
2913	1	2860	\N
2914	1	2841	\N
2915	1	2862	\N
2916	1	2863	\N
2917	1	2864	\N
2918	1	2865	\N
2919	1	2866	\N
2920	1	2867	\N
2921	1	2868	\N
2922	1	2869	\N
2923	1	2870	\N
2924	1	2872	\N
2925	1	2873	\N
2926	1	2874	\N
2927	1	2875	\N
2928	1	2876	\N
2929	1	2877	\N
2930	1	2878	\N
2931	1	2879	\N
2932	1	2880	\N
2933	1	2882	\N
2934	1	2883	\N
2935	1	2884	\N
2936	1	2885	\N
2937	1	2886	\N
2938	1	467	\N
2939	1	2887	\N
2940	1	2888	\N
2941	1	2889	\N
2942	1	2890	\N
2943	1	5396	\N
2944	1	5397	\N
2945	1	2891	\N
2946	1	5399	\N
2947	1	5400	\N
2948	1	2892	\N
2949	1	4515	\N
2950	1	5401	\N
2951	1	5402	\N
2952	1	5403	\N
2953	1	5404	\N
2954	1	2893	\N
2955	1	2894	\N
2956	1	2895	\N
2957	1	2896	\N
2958	1	2897	\N
2959	1	5405	\N
2960	1	5398	\N
2961	1	5406	\N
2962	1	5407	\N
2963	1	5408	\N
2964	1	5409	\N
2965	1	5410	\N
2966	1	5411	\N
2967	1	5412	\N
2968	1	5413	\N
2969	1	5414	\N
2970	1	5415	\N
2971	1	5416	\N
2972	1	2898	\N
2973	1	2899	\N
2974	1	2900	\N
2975	1	2901	\N
2976	1	2902	\N
2977	1	2903	\N
2978	1	4542	\N
2979	1	468	\N
2980	1	2904	\N
2981	1	2905	\N
2982	1	2906	\N
2983	1	2907	\N
2984	1	2908	\N
2985	1	2909	\N
2986	1	2910	\N
2987	1	2912	\N
2988	1	2913	\N
2989	1	2914	\N
2990	1	2915	\N
2991	1	2916	\N
2992	1	2917	\N
2993	1	2918	\N
2994	1	2919	\N
2995	1	2920	\N
2996	1	2922	\N
2997	1	2923	\N
2998	1	2924	\N
2999	1	2925	\N
3000	1	2926	\N
3001	1	2927	\N
3002	1	5417	\N
3003	1	5418	\N
3004	1	5419	\N
3005	1	5420	\N
3006	1	5421	\N
3007	1	5422	\N
3008	1	5423	\N
3009	1	5424	\N
3010	1	5425	\N
3011	1	5426	\N
3012	1	5427	\N
3013	1	5428	\N
3014	1	5430	\N
3015	1	5431	\N
3016	1	5432	\N
3017	1	5433	\N
3018	1	5434	\N
3019	1	5435	\N
3020	1	5436	\N
3021	1	5438	\N
3022	1	5439	\N
3023	1	5440	\N
3024	1	5441	\N
3025	1	5442	\N
3026	1	5443	\N
3027	1	5444	\N
3028	1	5445	\N
3029	1	5446	\N
3030	1	5447	\N
3031	1	5448	\N
3032	1	5449	\N
3033	1	5450	\N
3034	1	5451	\N
3035	1	2928	\N
3036	1	2929	\N
3037	1	2930	\N
3038	1	2932	\N
3039	1	2933	\N
3040	1	2934	\N
3041	1	2935	\N
3042	1	2936	\N
3043	1	2937	\N
3044	1	2938	\N
3045	1	2939	\N
3046	1	2941	\N
3047	1	2942	\N
3048	1	2943	\N
3049	1	2944	\N
3050	1	2945	\N
3051	1	2946	\N
3052	1	2947	\N
3053	1	2948	\N
3054	1	2950	\N
3055	1	2951	\N
3056	1	2952	\N
3057	1	2953	\N
3058	1	2954	\N
3059	1	2955	\N
3060	1	2956	\N
3061	1	2957	\N
3062	1	2958	\N
3063	1	2959	\N
3064	1	2960	\N
3065	1	2961	\N
3066	1	2962	\N
3067	1	2963	\N
3068	1	2964	\N
3069	1	2965	\N
3070	1	2966	\N
3071	1	2967	\N
3072	1	2968	\N
3073	1	2969	\N
3074	1	2970	\N
3075	1	2971	\N
3076	1	2972	\N
3077	1	2973	\N
3078	1	2974	\N
3079	1	2976	\N
3080	1	2977	\N
3081	1	2978	\N
3082	1	2979	\N
3083	1	2980	\N
3084	1	2981	\N
3085	1	2982	\N
3086	1	2983	\N
3087	1	2984	\N
3088	1	2985	\N
3089	1	2986	\N
3090	1	2987	\N
3091	1	2988	\N
3092	1	2989	\N
3093	1	2990	\N
3094	1	2991	\N
3095	1	2992	\N
3096	1	2993	\N
3097	1	2994	\N
3098	1	2995	\N
3099	1	2996	\N
3100	1	2997	\N
3101	1	2998	\N
3102	1	2999	\N
3103	1	3001	\N
3104	1	3002	\N
3105	1	3003	\N
3106	1	3004	\N
3107	1	3005	\N
3108	1	3006	\N
3109	1	3007	\N
3110	1	3008	\N
3111	1	3010	\N
3112	1	3011	\N
3113	1	4551	\N
3114	1	469	\N
3115	1	3012	\N
3116	1	5452	\N
3117	1	5453	\N
3118	1	5454	\N
3119	1	5455	\N
3120	1	5456	\N
3121	1	5457	\N
3122	1	5458	\N
3123	1	5459	\N
3124	1	5460	\N
3125	1	5461	\N
3126	1	5462	\N
3127	1	5463	\N
3128	1	5464	\N
3129	1	5465	\N
3130	1	5466	\N
3131	1	5467	\N
3132	1	5468	\N
3133	1	5469	\N
3134	1	5470	\N
3135	1	5471	\N
3136	1	5472	\N
3137	1	5473	\N
3138	1	5474	\N
3139	1	5475	\N
3140	1	5476	\N
3141	1	5477	\N
3142	1	5478	\N
3143	1	5479	\N
3144	1	5480	\N
3145	1	5481	\N
3146	1	5482	\N
3147	1	5483	\N
3148	1	5484	\N
3149	1	5485	\N
3150	1	3013	\N
3151	1	470	\N
3152	1	3014	\N
3153	1	3015	\N
3154	1	3016	\N
3155	1	4671	\N
3156	1	471	\N
3157	1	3017	\N
3158	1	3018	\N
3159	1	4681	\N
3160	1	472	\N
3161	1	5354	\N
3162	1	473	\N
3163	1	5355	\N
3164	1	474	\N
3165	1	2911	\N
3166	1	2975	\N
3167	1	3009	\N
3168	1	3019	\N
3169	1	3020	\N
3170	1	3021	\N
3171	1	3022	\N
3172	1	3023	\N
3173	1	3024	\N
3174	1	3025	\N
3175	1	3026	\N
3176	1	3027	\N
3177	1	3028	\N
3178	1	3030	\N
3179	1	3031	\N
3180	1	3032	\N
3181	1	3033	\N
3182	1	3034	\N
3183	1	3035	\N
3184	1	3036	\N
3185	1	3037	\N
3186	1	5486	\N
3187	1	3038	\N
3188	1	3039	\N
3189	1	3040	\N
3190	1	3041	\N
3191	1	3042	\N
3192	1	3043	\N
3193	1	3044	\N
3194	1	3045	\N
3195	1	5356	\N
3196	1	475	\N
3197	1	3046	\N
3198	1	3047	\N
3199	1	3048	\N
3200	1	3050	\N
3201	1	3051	\N
3202	1	3052	\N
3203	1	3053	\N
3204	1	3054	\N
3205	1	3055	\N
3206	1	3056	\N
3207	1	3057	\N
3208	1	3058	\N
3209	1	3059	\N
3210	1	3060	\N
3211	1	3061	\N
3212	1	3062	\N
3213	1	3063	\N
3214	1	3064	\N
3215	1	3065	\N
3216	1	3066	\N
3217	1	3067	\N
3218	1	3068	\N
3219	1	3070	\N
3220	1	3071	\N
3221	1	3072	\N
3222	1	3073	\N
3223	1	3074	\N
3224	1	3075	\N
3225	1	3076	\N
3226	1	3077	\N
3227	1	3078	\N
3228	1	3079	\N
3229	1	3080	\N
3230	1	3081	\N
3231	1	3082	\N
3232	1	3083	\N
3233	1	3084	\N
3234	1	3085	\N
3235	1	3086	\N
3236	1	3087	\N
3237	1	3089	\N
3238	1	3090	\N
3239	1	3091	\N
3240	1	3092	\N
3241	1	3093	\N
3242	1	3094	\N
3243	1	3095	\N
3244	1	3096	\N
3245	1	3098	\N
3246	1	3099	\N
3247	1	3100	\N
3248	1	3101	\N
3249	1	3102	\N
3250	1	3103	\N
3251	1	3104	\N
3252	1	3105	\N
3253	1	3106	\N
3254	1	3107	\N
3255	1	3108	\N
3256	1	3109	\N
3257	1	3110	\N
3258	1	3111	\N
3259	1	3112	\N
3260	1	3113	\N
3261	1	3114	\N
3262	1	3115	\N
3263	1	3116	\N
3264	1	3117	\N
3265	1	3118	\N
3266	1	3119	\N
3267	1	3120	\N
3268	1	3121	\N
3269	1	3122	\N
3270	1	3123	\N
3271	1	3125	\N
3272	1	3126	\N
3273	1	3127	\N
3274	1	3128	\N
3275	1	3129	\N
3276	1	3130	\N
3277	1	3131	\N
3278	1	3132	\N
3279	1	3133	\N
3280	1	3134	\N
3281	1	3135	\N
3282	1	3136	\N
3283	1	3137	\N
3284	1	3138	\N
3285	1	3139	\N
3286	1	3140	\N
3287	1	3141	\N
3288	1	3143	\N
3289	1	3144	\N
3290	1	3145	\N
3291	1	3146	\N
3292	1	3147	\N
3293	1	3148	\N
3294	1	3149	\N
3295	1	3150	\N
3296	1	3152	\N
3297	1	3153	\N
3298	1	3154	\N
3299	1	3155	\N
3300	1	3156	\N
3301	1	3157	\N
3302	1	3158	\N
3303	1	3159	\N
3304	1	3160	\N
3305	1	3161	\N
3306	1	3162	\N
3307	1	3163	\N
3308	1	3164	\N
3309	1	3165	\N
3310	1	3166	\N
3311	1	3167	\N
3312	1	3168	\N
3313	1	3170	\N
3314	1	3171	\N
3315	1	3172	\N
3316	1	3173	\N
3317	1	3174	\N
3318	1	3175	\N
3319	1	3176	\N
3320	1	3177	\N
3321	1	3179	\N
3322	1	3180	\N
3323	1	3181	\N
3324	1	3182	\N
3325	1	3183	\N
3326	1	3184	\N
3327	1	3185	\N
3328	1	3186	\N
3329	1	3187	\N
3330	1	3188	\N
3331	1	3189	\N
3332	1	3190	\N
3333	1	3191	\N
3334	1	3192	\N
3335	1	3193	\N
3336	1	3194	\N
3337	1	3195	\N
3338	1	3196	\N
3339	1	3197	\N
3340	1	3198	\N
3341	1	3199	\N
3342	1	3200	\N
3343	1	3201	\N
3344	1	3202	\N
3345	1	3203	\N
3346	1	3204	\N
3347	1	3205	\N
3348	1	3207	\N
3349	1	3208	\N
3350	1	3209	\N
3351	1	3210	\N
3352	1	3211	\N
3353	1	3212	\N
3354	1	3213	\N
3355	1	3214	\N
3356	1	3215	\N
3357	1	3217	\N
3358	1	3218	\N
3359	1	3219	\N
3360	1	3220	\N
3361	1	3221	\N
3362	1	3222	\N
3363	1	3223	\N
3364	1	3224	\N
3365	1	3226	\N
3366	1	3227	\N
3367	1	3228	\N
3368	1	3229	\N
3369	1	3230	\N
3370	1	3231	\N
3371	1	3232	\N
3372	1	3233	\N
3373	1	3235	\N
3374	1	3236	\N
3375	1	3237	\N
3376	1	3238	\N
3377	1	3239	\N
3378	1	3240	\N
3379	1	3241	\N
3380	1	3242	\N
3381	1	3244	\N
3382	1	3245	\N
3383	1	3246	\N
3384	1	3247	\N
3385	1	3248	\N
3386	1	3249	\N
3387	1	3250	\N
3388	1	3251	\N
3389	1	3253	\N
3390	1	3254	\N
3391	1	3255	\N
3392	1	3256	\N
3393	1	3257	\N
3394	1	3258	\N
3395	1	3259	\N
3396	1	3260	\N
3397	1	3262	\N
3398	1	3263	\N
3399	1	3264	\N
3400	1	3265	\N
3401	1	3266	\N
3402	1	3267	\N
3403	1	3268	\N
3404	1	3269	\N
3405	1	3271	\N
3406	1	3272	\N
3407	1	3273	\N
3408	1	3274	\N
3409	1	3275	\N
3410	1	3276	\N
3411	1	3277	\N
3412	1	3278	\N
3413	1	3280	\N
3414	1	3281	\N
3415	1	3282	\N
3416	1	3283	\N
3417	1	3284	\N
3418	1	3285	\N
3419	1	3286	\N
3420	1	3287	\N
3421	1	3289	\N
3422	1	3290	\N
3423	1	3291	\N
3424	1	3292	\N
3425	1	3293	\N
3426	1	3294	\N
3427	1	3295	\N
3428	1	3296	\N
3429	1	3225	\N
3430	1	3243	\N
3431	1	3298	\N
3432	1	3299	\N
3433	1	3300	\N
3434	1	3301	\N
3435	1	3302	\N
3436	1	3303	\N
3437	1	3304	\N
3438	1	3305	\N
3439	1	3306	\N
3440	1	3307	\N
3441	1	3308	\N
3442	1	3309	\N
3443	1	3310	\N
3444	1	3311	\N
3445	1	3312	\N
3446	1	3313	\N
3447	1	3314	\N
3448	1	3315	\N
3449	1	3316	\N
3450	1	3317	\N
3451	1	3318	\N
3452	1	3319	\N
3453	1	3320	\N
3454	1	3321	\N
3455	1	3322	\N
3456	1	3323	\N
3457	1	3324	\N
3458	1	5487	\N
3459	1	5488	\N
3460	1	5489	\N
3461	1	5490	\N
3462	1	5491	\N
3463	1	5492	\N
3464	1	5493	\N
3465	1	5494	\N
3466	1	5495	\N
3467	1	5496	\N
3468	1	5497	\N
3469	1	5498	\N
3470	1	5499	\N
3471	1	5500	\N
3472	1	5501	\N
3473	1	5502	\N
3474	1	5503	\N
3475	1	5357	\N
3476	1	476	\N
3477	1	3325	\N
3478	1	3252	\N
3479	1	3279	\N
3480	1	2861	\N
3481	1	3169	\N
3482	1	3234	\N
3483	1	3326	\N
3484	1	3327	\N
3485	1	3328	\N
3486	1	3329	\N
3487	1	3330	\N
3488	1	3331	\N
3489	1	3332	\N
3490	1	3333	\N
3491	1	3334	\N
3492	1	3335	\N
3493	1	3336	\N
3494	1	3337	\N
3495	1	3338	\N
3496	1	3339	\N
3497	1	3340	\N
3498	1	3341	\N
3499	1	3342	\N
3500	1	3343	\N
3501	1	5504	\N
3502	1	5505	\N
3503	1	5506	\N
3504	1	3344	\N
3505	1	5358	\N
3506	1	477	\N
3507	1	3345	\N
3508	1	3346	\N
3509	1	3347	\N
3510	1	3348	\N
3511	1	3349	\N
3512	1	3350	\N
3513	1	3351	\N
3514	1	3352	\N
3515	1	3353	\N
3516	1	3354	\N
3517	1	3355	\N
3518	1	3356	\N
3519	1	3357	\N
3520	1	3358	\N
3521	1	5359	\N
3522	1	478	\N
3523	1	3359	\N
3524	1	3360	\N
3525	1	3361	\N
3526	1	3362	\N
3527	1	3363	\N
3528	1	3364	\N
3529	1	3365	\N
3530	1	3366	\N
3531	1	3368	\N
3532	1	3369	\N
3533	1	3370	\N
3534	1	3371	\N
3535	1	3372	\N
3536	1	3373	\N
3537	1	3374	\N
3538	1	3375	\N
3539	1	3376	\N
3540	1	3377	\N
3541	1	3378	\N
3542	1	3379	\N
3543	1	3380	\N
3544	1	3381	\N
3545	1	3382	\N
3546	1	3383	\N
3547	1	3384	\N
3548	1	3385	\N
3549	1	3386	\N
3550	1	3387	\N
3551	1	3388	\N
3552	1	3389	\N
3553	1	3390	\N
3554	1	3391	\N
3555	1	3392	\N
3556	1	3393	\N
3557	1	3394	\N
3558	1	3395	\N
3559	1	3396	\N
3560	1	3397	\N
3561	1	3398	\N
3562	1	3399	\N
3563	1	3400	\N
3564	1	3401	\N
3565	1	3402	\N
3566	1	3403	\N
3567	1	3405	\N
3568	1	3406	\N
3569	1	3407	\N
3570	1	3408	\N
3571	1	3409	\N
3572	1	3410	\N
3573	1	3411	\N
3574	1	3412	\N
3575	1	3413	\N
3576	1	3415	\N
3577	1	3416	\N
3578	1	3417	\N
3579	1	3418	\N
3580	1	3419	\N
3581	1	3420	\N
3582	1	3421	\N
3583	1	3422	\N
3584	1	3423	\N
3585	1	3424	\N
3586	1	3425	\N
3587	1	3426	\N
3588	1	3427	\N
3589	1	3428	\N
3590	1	3429	\N
3591	1	3430	\N
3592	1	3431	\N
3593	1	3432	\N
3594	1	3433	\N
3595	1	3434	\N
3596	1	3435	\N
3597	1	3436	\N
3598	1	3437	\N
3599	1	3438	\N
3600	1	3439	\N
3601	1	3440	\N
3602	1	3441	\N
3603	1	3443	\N
3604	1	3444	\N
3605	1	3445	\N
3606	1	5507	\N
3607	1	3446	\N
3608	1	3447	\N
3609	1	3448	\N
3610	1	3449	\N
3611	1	479	\N
3612	1	480	\N
3613	1	481	\N
3614	1	3450	\N
3615	1	3451	\N
3616	1	3452	\N
3617	1	3453	\N
3618	1	482	\N
3619	1	5508	\N
3620	1	483	\N
3621	1	3454	\N
3622	1	5509	\N
3623	1	3455	\N
3624	1	3456	\N
3625	1	3457	\N
3626	1	3458	\N
3627	1	5510	\N
3628	1	3459	\N
3629	1	3460	\N
3630	1	3297	\N
3631	1	5360	\N
3632	1	3462	\N
3633	1	3463	\N
3634	1	3464	\N
3635	1	3465	\N
3636	1	3466	\N
3637	1	5361	\N
3638	1	484	\N
3639	1	5362	\N
3640	1	485	\N
3641	1	3467	\N
3642	1	5363	\N
3643	1	486	\N
3644	1	5364	\N
3645	1	487	\N
3646	1	3468	\N
3647	1	3469	\N
3648	1	3470	\N
3649	1	3471	\N
3650	1	3472	\N
3651	1	3473	\N
3652	1	488	\N
3653	1	489	\N
3654	1	338	\N
3655	1	431	\N
3656	1	3474	\N
3657	1	3475	\N
3658	1	3476	\N
3659	1	3477	\N
3660	1	3478	\N
3661	1	3479	\N
3662	1	3480	\N
3663	1	3481	\N
3664	1	3482	\N
3665	1	3483	\N
3666	1	3484	\N
3667	1	3485	\N
3668	1	3486	\N
3669	1	3487	\N
3670	1	5365	\N
3671	1	490	\N
3672	1	3488	\N
3673	1	3489	\N
3674	1	3490	\N
3675	1	3491	\N
3676	1	3492	\N
3677	1	3493	\N
3678	1	3494	\N
3679	1	3495	\N
3680	1	491	\N
3681	1	492	\N
3682	1	493	\N
3683	1	3496	\N
3684	1	3497	\N
3685	1	3498	\N
3686	1	3499	\N
3687	1	3500	\N
3688	1	3501	\N
3689	1	3502	\N
3690	1	3503	\N
3691	1	3504	\N
3692	1	3505	\N
3693	1	3506	\N
3694	1	3507	\N
3695	1	3509	\N
3696	1	3510	\N
3697	1	3511	\N
3698	1	3512	\N
3699	1	3513	\N
3700	1	3514	\N
3701	1	3515	\N
3702	1	3516	\N
3703	1	3517	\N
3704	1	3518	\N
3705	1	494	\N
3706	1	5366	\N
3707	1	495	\N
3708	1	5367	\N
3709	1	496	\N
3710	1	3519	\N
3711	1	3520	\N
3712	1	3521	\N
3713	1	3522	\N
3714	1	3523	\N
3715	1	3524	\N
3716	1	3525	\N
3717	1	3526	\N
3718	1	3528	\N
3719	1	3529	\N
3720	1	3530	\N
3721	1	3531	\N
3722	1	3532	\N
3723	1	3533	\N
3724	1	3534	\N
3725	1	3535	\N
3726	1	3536	\N
3727	1	3538	\N
3728	1	3539	\N
3729	1	3540	\N
3730	1	3541	\N
3731	1	3542	\N
3732	1	3543	\N
3733	1	3544	\N
3734	1	3545	\N
3735	1	3546	\N
3736	1	3548	\N
3737	1	3549	\N
3738	1	3550	\N
3739	1	3551	\N
3740	1	3552	\N
3741	1	3553	\N
3742	1	3554	\N
3743	1	3555	\N
3744	1	3556	\N
3745	1	3558	\N
3746	1	3559	\N
3747	1	3560	\N
3748	1	3561	\N
3749	1	3562	\N
3750	1	3563	\N
3751	1	3564	\N
3752	1	3565	\N
3753	1	3566	\N
3754	1	3568	\N
3755	1	3569	\N
3756	1	3570	\N
3757	1	3571	\N
3758	1	3572	\N
3759	1	3573	\N
3760	1	3574	\N
3761	1	3575	\N
3762	1	3576	\N
3763	1	3578	\N
3764	1	3579	\N
3765	1	3580	\N
3766	1	3581	\N
3767	1	3582	\N
3768	1	3583	\N
3769	1	3584	\N
3770	1	3585	\N
3771	1	3586	\N
3772	1	3588	\N
3773	1	3589	\N
3774	1	3590	\N
3775	1	3591	\N
3776	1	3592	\N
3777	1	3593	\N
3778	1	3594	\N
3779	1	3595	\N
3780	1	3596	\N
3781	1	3598	\N
3782	1	3599	\N
3783	1	3600	\N
3784	1	3601	\N
3785	1	3602	\N
3786	1	3603	\N
3787	1	3604	\N
3788	1	3605	\N
3789	1	3606	\N
3790	1	3608	\N
3791	1	3609	\N
3792	1	3610	\N
3793	1	3611	\N
3794	1	3612	\N
3795	1	3613	\N
3796	1	3614	\N
3797	1	3615	\N
3798	1	3616	\N
3799	1	3618	\N
3800	1	3619	\N
3801	1	3620	\N
3802	1	3621	\N
3803	1	3622	\N
3804	1	3623	\N
3805	1	3624	\N
3806	1	3625	\N
3807	1	3626	\N
3808	1	3628	\N
3809	1	3629	\N
3810	1	3630	\N
3811	1	3631	\N
3812	1	3632	\N
3813	1	3633	\N
3814	1	3634	\N
3815	1	3635	\N
3816	1	3636	\N
3817	1	3638	\N
3818	1	3639	\N
3819	1	3640	\N
3820	1	3641	\N
3821	1	3642	\N
3822	1	3643	\N
3823	1	3644	\N
3824	1	3645	\N
3825	1	5368	\N
3826	1	497	\N
3827	1	3646	\N
3828	1	3647	\N
3829	1	3627	\N
3830	1	5511	\N
3831	1	5512	\N
3832	1	5513	\N
3833	1	5514	\N
3834	1	5515	\N
3835	1	5516	\N
3836	1	5517	\N
3837	1	5518	\N
3838	1	5519	\N
3839	1	5429	\N
3840	1	5437	\N
3841	1	5520	\N
3842	1	5521	\N
3843	1	5522	\N
3844	1	5523	\N
3845	1	5524	\N
3846	1	5525	\N
3847	1	5526	\N
3848	1	5527	\N
3849	1	5528	\N
3850	1	5529	\N
3851	1	5530	\N
3852	1	5531	\N
3853	1	5532	\N
3854	1	3648	\N
3855	1	3649	\N
3856	1	3650	\N
3857	1	3651	\N
3858	1	3652	\N
3859	1	3653	\N
3860	1	3654	\N
3861	1	3655	\N
3862	1	3656	\N
3863	1	3657	\N
3864	1	3658	\N
3865	1	3659	\N
3866	1	3660	\N
3867	1	3661	\N
3868	1	3662	\N
3869	1	3663	\N
3870	1	3664	\N
3871	1	3665	\N
3872	1	3666	\N
3873	1	3667	\N
3874	1	3668	\N
3875	1	3669	\N
3876	1	3670	\N
3877	1	3671	\N
3878	1	3672	\N
3879	1	3673	\N
3880	1	3674	\N
3881	1	3675	\N
3882	1	3676	\N
3883	1	3677	\N
3884	1	3678	\N
3885	1	3679	\N
3886	1	3680	\N
3887	1	3681	\N
3888	1	3682	\N
3889	1	3683	\N
3890	1	3684	\N
3891	1	3685	\N
3892	1	3686	\N
3893	1	3687	\N
3894	1	3688	\N
3895	1	3689	\N
3896	1	3690	\N
3897	1	3691	\N
3898	1	3692	\N
3899	1	3693	\N
3900	1	3694	\N
3901	1	3695	\N
3902	1	3696	\N
3903	1	3697	\N
3904	1	3698	\N
3905	1	3699	\N
3906	1	3700	\N
3907	1	3702	\N
3908	1	3703	\N
3909	1	3704	\N
3910	1	3705	\N
3911	1	3706	\N
3912	1	3707	\N
3913	1	3708	\N
3914	1	3709	\N
3915	1	3710	\N
3916	1	3711	\N
3917	1	3712	\N
3918	1	3713	\N
3919	1	3714	\N
3920	1	3715	\N
3921	1	3716	\N
3922	1	3717	\N
3923	1	3718	\N
3924	1	3720	\N
3925	1	3721	\N
3926	1	3722	\N
3927	1	3723	\N
3928	1	3724	\N
3929	1	3725	\N
3930	1	3726	\N
3931	1	3727	\N
3932	1	3729	\N
3933	1	3730	\N
3934	1	3731	\N
3935	1	3732	\N
3936	1	3733	\N
3937	1	3734	\N
3938	1	3735	\N
3939	1	3736	\N
3940	1	3738	\N
3941	1	3739	\N
3942	1	3740	\N
3943	1	3741	\N
3944	1	3742	\N
3945	1	3743	\N
3946	1	3744	\N
3947	1	3745	\N
3948	1	3747	\N
3949	1	3748	\N
3950	1	3749	\N
3951	1	3750	\N
3952	1	3751	\N
3953	1	3752	\N
3954	1	3753	\N
3955	1	3754	\N
3956	1	3756	\N
3957	1	3757	\N
3958	1	3758	\N
3959	1	3759	\N
3960	1	3760	\N
3961	1	3761	\N
3962	1	3762	\N
3963	1	3763	\N
3964	1	3765	\N
3965	1	3766	\N
3966	1	3767	\N
3967	1	3768	\N
3968	1	3769	\N
3969	1	3770	\N
3970	1	3771	\N
3971	1	3772	\N
3972	1	5369	\N
3973	1	5370	\N
3974	1	5371	\N
3975	1	5272	\N
3976	1	774	\N
3977	1	895	\N
3978	1	1914	\N
3979	1	5372	\N
3980	1	498	\N
3981	1	5373	\N
3982	1	499	\N
3983	1	3701	\N
3984	1	3774	\N
3985	1	3775	\N
3986	1	3776	\N
3987	1	3777	\N
3988	1	3778	\N
3989	1	3779	\N
3990	1	3780	\N
3991	1	3781	\N
3992	1	3782	\N
3993	1	3784	\N
3994	1	3785	\N
3995	1	3786	\N
3996	1	3787	\N
3997	1	3788	\N
3998	1	3789	\N
3999	1	3790	\N
4000	1	3791	\N
4001	1	3792	\N
4002	1	3793	\N
4003	1	3794	\N
4004	1	3795	\N
4005	1	3796	\N
4006	1	3797	\N
4007	1	3798	\N
4008	1	3799	\N
4009	1	3800	\N
4010	1	3801	\N
4011	1	3803	\N
4012	1	3804	\N
4013	1	3805	\N
4014	1	3806	\N
4015	1	3807	\N
4016	1	3808	\N
4017	1	3809	\N
4018	1	3810	\N
4019	1	3811	\N
4020	1	3812	\N
4021	1	5374	\N
4022	1	3814	\N
4023	1	3815	\N
4024	1	3816	\N
4025	1	3817	\N
4026	1	3818	\N
4027	1	5375	\N
4028	1	500	\N
4029	1	3819	\N
4030	1	3820	\N
4031	1	3821	\N
4032	1	3822	\N
4033	1	3823	\N
4034	1	3783	\N
4035	1	5376	\N
4036	1	3825	\N
4037	1	3826	\N
4038	1	3827	\N
4039	1	3828	\N
4040	1	3829	\N
4041	1	3830	\N
4042	1	3831	\N
4043	1	5377	\N
4044	1	501	\N
4045	1	3832	\N
4046	1	3833	\N
4047	1	3637	\N
4048	1	3835	\N
4049	1	3836	\N
4050	1	3837	\N
4051	1	3838	\N
4052	1	3839	\N
4053	1	3840	\N
4054	1	3841	\N
4055	1	3842	\N
4056	1	3843	\N
4057	1	3844	\N
4058	1	3845	\N
4059	1	3846	\N
4060	1	3847	\N
4061	1	3848	\N
4062	1	5378	\N
4063	1	502	\N
4064	1	3849	\N
4065	1	3850	\N
4066	1	5379	\N
4067	1	503	\N
4068	1	3851	\N
4069	1	3852	\N
4070	1	5533	\N
4071	1	5534	\N
4072	1	5535	\N
4073	1	3853	\N
4074	1	3854	\N
4075	1	3856	\N
4076	1	3857	\N
4077	1	3858	\N
4078	1	3859	\N
4079	1	3860	\N
4080	1	3861	\N
4081	1	3862	\N
4082	1	3863	\N
4083	1	3864	\N
4084	1	3865	\N
4085	1	3866	\N
4086	1	3867	\N
4087	1	3868	\N
4088	1	3869	\N
4089	1	3870	\N
4090	1	3871	\N
4091	1	3872	\N
4092	1	3873	\N
4093	1	3874	\N
4094	1	3875	\N
4095	1	3876	\N
4096	1	3877	\N
4097	1	3878	\N
4098	1	3879	\N
4099	1	3880	\N
4100	1	3881	\N
4101	1	3882	\N
4102	1	3883	\N
4103	1	3884	\N
4104	1	3885	\N
4105	1	3886	\N
4106	1	3887	\N
4107	1	3888	\N
4108	1	3889	\N
4109	1	3890	\N
4110	1	3891	\N
4111	1	3892	\N
4112	1	3893	\N
4113	1	3894	\N
4114	1	3895	\N
4115	1	3896	\N
4116	1	3897	\N
4117	1	3898	\N
4118	1	3899	\N
4119	1	3900	\N
4120	1	3901	\N
4121	1	3902	\N
4122	1	3903	\N
4123	1	3904	\N
4124	1	3905	\N
4125	1	3906	\N
4126	1	3907	\N
4127	1	3908	\N
4128	1	3909	\N
4129	1	3910	\N
4130	1	3911	\N
4131	1	3912	\N
4132	1	3913	\N
4133	1	3914	\N
4134	1	3915	\N
4135	1	3916	\N
4136	1	3917	\N
4137	1	3918	\N
4138	1	3919	\N
4139	1	3920	\N
4140	1	3921	\N
4141	1	3922	\N
4142	1	3923	\N
4143	1	3924	\N
4144	1	3925	\N
4145	1	3926	\N
4146	1	3927	\N
4147	1	3928	\N
4148	1	3929	\N
4149	1	3930	\N
4150	1	3931	\N
4151	1	3932	\N
4152	1	3933	\N
4153	1	3935	\N
4154	1	3936	\N
4155	1	3937	\N
4156	1	3938	\N
4157	1	3939	\N
4158	1	3940	\N
4159	1	3941	\N
4160	1	3942	\N
4161	1	3943	\N
4162	1	3944	\N
4163	1	3855	\N
4164	1	3945	\N
4165	1	3946	\N
4166	1	3947	\N
4167	1	3948	\N
4168	1	3949	\N
4169	1	3950	\N
4170	1	3951	\N
4171	1	3952	\N
4172	1	3953	\N
4173	1	3954	\N
4174	1	3955	\N
4175	1	3956	\N
4176	1	3957	\N
4177	1	3958	\N
4178	1	3959	\N
4179	1	3960	\N
4180	1	3961	\N
4181	1	3962	\N
4182	1	3963	\N
4183	1	3964	\N
4184	1	3965	\N
4185	1	3966	\N
4186	1	3967	\N
4187	1	3968	\N
4188	1	3969	\N
4189	1	3970	\N
4190	1	3971	\N
4191	1	3972	\N
4192	1	3973	\N
4193	1	3974	\N
4194	1	3975	\N
4195	1	3976	\N
4196	1	3977	\N
4197	1	3978	\N
4198	1	3979	\N
4199	1	3980	\N
4200	1	3981	\N
4201	1	3982	\N
4202	1	3983	\N
4203	1	3984	\N
4204	1	3985	\N
4205	1	3986	\N
4206	1	3987	\N
4207	1	3988	\N
4208	1	3989	\N
4209	1	3990	\N
4210	1	3991	\N
4211	1	3992	\N
4212	1	3993	\N
4213	1	3994	\N
4214	1	3995	\N
4215	1	3996	\N
4216	1	3997	\N
4217	1	3998	\N
4218	1	3999	\N
4219	1	4000	\N
4220	1	4001	\N
4221	1	4002	\N
4222	1	4003	\N
4223	1	4004	\N
4224	1	4005	\N
4225	1	4006	\N
4226	1	4007	\N
4227	1	4008	\N
4228	1	4009	\N
4229	1	4010	\N
4230	1	4011	\N
4231	1	4012	\N
4232	1	4013	\N
4233	1	4014	\N
4234	1	4015	\N
4235	1	4016	\N
4236	1	4017	\N
4237	1	4018	\N
4238	1	4019	\N
4239	1	4020	\N
4240	1	4021	\N
4241	1	4022	\N
4242	1	4023	\N
4243	1	4024	\N
4244	1	4025	\N
4245	1	4026	\N
4246	1	4027	\N
4247	1	4028	\N
4248	1	4029	\N
4249	1	4030	\N
4250	1	4031	\N
4251	1	4032	\N
4252	1	4033	\N
4253	1	4034	\N
4254	1	4035	\N
4255	1	4036	\N
4256	1	4037	\N
4257	1	4038	\N
4258	1	4039	\N
4259	1	4040	\N
4260	1	4041	\N
4261	1	4042	\N
4262	1	4043	\N
4263	1	4044	\N
4264	1	4045	\N
4265	1	4046	\N
4266	1	4047	\N
4267	1	4048	\N
4268	1	4049	\N
4269	1	4050	\N
4270	1	4051	\N
4271	1	4052	\N
4272	1	4053	\N
4273	1	4054	\N
4274	1	4055	\N
4275	1	4056	\N
4276	1	4057	\N
4277	1	4058	\N
4278	1	4059	\N
4279	1	4060	\N
4280	1	4061	\N
4281	1	4063	\N
4282	1	4064	\N
4283	1	4065	\N
4284	1	4066	\N
4285	1	4067	\N
4286	1	4068	\N
4287	1	4069	\N
4288	1	4070	\N
4289	1	4071	\N
4290	1	4072	\N
4291	1	4073	\N
4292	1	4074	\N
4293	1	4075	\N
4294	1	4076	\N
4295	1	4077	\N
4296	1	4078	\N
4297	1	4079	\N
4298	1	4080	\N
4299	1	4081	\N
4300	1	4082	\N
4301	1	4083	\N
4302	1	4084	\N
4303	1	4085	\N
4304	1	4086	\N
4305	1	4087	\N
4306	1	4088	\N
4307	1	4089	\N
4308	1	4090	\N
4309	1	4091	\N
4310	1	4093	\N
4311	1	4094	\N
4312	1	4095	\N
4313	1	4096	\N
4314	1	4097	\N
4315	1	4098	\N
4316	1	4099	\N
4317	1	4100	\N
4318	1	4101	\N
4319	1	4103	\N
4320	1	4104	\N
4321	1	4105	\N
4322	1	4106	\N
4323	1	4107	\N
4324	1	4108	\N
4325	1	4109	\N
4326	1	4110	\N
4327	1	4111	\N
4328	1	4112	\N
4329	1	4102	\N
4330	1	4113	\N
4331	1	4114	\N
4332	1	4115	\N
4333	1	4116	\N
4334	1	4117	\N
4335	1	4118	\N
4336	1	4119	\N
4337	1	4120	\N
4338	1	4121	\N
4339	1	4122	\N
4340	1	4123	\N
4341	1	4124	\N
4342	1	4125	\N
4343	1	4126	\N
4344	1	4127	\N
4345	1	4128	\N
4346	1	4129	\N
4347	1	4130	\N
4348	1	4131	\N
4349	1	4132	\N
4350	1	4133	\N
4351	1	4134	\N
4352	1	4135	\N
4353	1	4136	\N
4354	1	4137	\N
4355	1	4138	\N
4356	1	4139	\N
4357	1	4140	\N
4358	1	4141	\N
4359	1	4143	\N
4360	1	4144	\N
4361	1	4145	\N
4362	1	4146	\N
4363	1	4147	\N
4364	1	4148	\N
4365	1	4149	\N
4366	1	4150	\N
4367	1	4151	\N
4368	1	4153	\N
4369	1	4154	\N
4370	1	4155	\N
4371	1	4156	\N
4372	1	4157	\N
4373	1	4158	\N
4374	1	4159	\N
4375	1	4160	\N
4376	1	4162	\N
4377	1	4163	\N
4378	1	4164	\N
4379	1	4165	\N
4380	1	4166	\N
4381	1	4167	\N
4382	1	4168	\N
4383	1	4169	\N
4384	1	4161	\N
4385	1	4171	\N
4386	1	4172	\N
4387	1	4173	\N
4388	1	4174	\N
4389	1	4175	\N
4390	1	4176	\N
4391	1	4177	\N
4392	1	4178	\N
4393	1	4179	\N
4394	1	4181	\N
4395	1	4182	\N
4396	1	4183	\N
4397	1	4184	\N
4398	1	4185	\N
4399	1	4186	\N
4400	1	4187	\N
4401	1	4188	\N
4402	1	4189	\N
4403	1	4190	\N
4404	1	4191	\N
4405	1	4192	\N
4406	1	4193	\N
4407	1	4194	\N
4408	1	4195	\N
4409	1	4196	\N
4410	1	4197	\N
4411	1	4198	\N
4412	1	4199	\N
4413	1	4201	\N
4414	1	4202	\N
4415	1	4203	\N
4416	1	4204	\N
4417	1	4205	\N
4418	1	4206	\N
4419	1	4207	\N
4420	1	4208	\N
4421	1	4209	\N
4422	1	4210	\N
4423	1	4211	\N
4424	1	4212	\N
4425	1	4213	\N
4426	1	4214	\N
4427	1	4215	\N
4428	1	4216	\N
4429	1	4217	\N
4430	1	4218	\N
4431	1	4219	\N
4432	1	4221	\N
4433	1	4222	\N
4434	1	4223	\N
4435	1	4224	\N
4436	1	4225	\N
4437	1	4226	\N
4438	1	4227	\N
4439	1	4228	\N
4440	1	4229	\N
4441	1	4231	\N
4442	1	4232	\N
4443	1	4233	\N
4444	1	4234	\N
4445	1	4235	\N
4446	1	4236	\N
4447	1	4237	\N
4448	1	4238	\N
4449	1	4239	\N
4450	1	4240	\N
4451	1	4241	\N
4452	1	4170	\N
4453	1	4200	\N
4454	1	4230	\N
4455	1	3934	\N
4456	1	4092	\N
4457	1	4242	\N
4458	1	4243	\N
4459	1	4244	\N
4460	1	4245	\N
4461	1	4246	\N
4462	1	4247	\N
4463	1	4248	\N
4464	1	4249	\N
4465	1	4250	\N
4466	1	4251	\N
4467	1	4253	\N
4468	1	4254	\N
4469	1	4255	\N
4470	1	4256	\N
4471	1	4257	\N
4472	1	4258	\N
4473	1	4259	\N
4474	1	4260	\N
4475	1	4261	\N
4476	1	4263	\N
4477	1	4264	\N
4478	1	4265	\N
4479	1	4266	\N
4480	1	4267	\N
4481	1	4268	\N
4482	1	4269	\N
4483	1	4270	\N
4484	1	4272	\N
4485	1	4273	\N
4486	1	4274	\N
4487	1	4275	\N
4488	1	4276	\N
4489	1	4277	\N
4490	1	4278	\N
4491	1	4279	\N
4492	1	4280	\N
4493	1	4281	\N
4494	1	4282	\N
4495	1	4283	\N
4496	1	4284	\N
4497	1	4285	\N
4498	1	4286	\N
4499	1	4287	\N
4500	1	4288	\N
4501	1	4289	\N
4502	1	4291	\N
4503	1	4292	\N
4504	1	4293	\N
4505	1	4294	\N
4506	1	4295	\N
4507	1	4296	\N
4508	1	4297	\N
4509	1	4298	\N
4510	1	4299	\N
4511	1	4300	\N
4512	1	4301	\N
4513	1	4302	\N
4514	1	4303	\N
4515	1	4304	\N
4516	1	4305	\N
4517	1	4306	\N
4518	1	4307	\N
4519	1	4309	\N
4520	1	4310	\N
4521	1	4311	\N
4522	1	4312	\N
4523	1	4313	\N
4524	1	4314	\N
4525	1	4315	\N
4526	1	4316	\N
4527	1	4317	\N
4528	1	4318	\N
4529	1	4319	\N
4530	1	4320	\N
4531	1	4321	\N
4532	1	4322	\N
4533	1	4323	\N
4534	1	4324	\N
4535	1	4325	\N
4536	1	4327	\N
4537	1	4328	\N
4538	1	4329	\N
4539	1	4330	\N
4540	1	4331	\N
4541	1	4332	\N
4542	1	4333	\N
4543	1	4334	\N
4544	1	4336	\N
4545	1	4337	\N
4546	1	4338	\N
4547	1	4339	\N
4548	1	4340	\N
4549	1	4341	\N
4550	1	4342	\N
4551	1	4343	\N
4552	1	4345	\N
4553	1	4346	\N
4554	1	4347	\N
4555	1	4348	\N
4556	1	4349	\N
4557	1	4350	\N
4558	1	4351	\N
4559	1	4352	\N
4560	1	4354	\N
4561	1	4355	\N
4562	1	4356	\N
4563	1	4357	\N
4564	1	4358	\N
4565	1	4359	\N
4566	1	4360	\N
4567	1	4361	\N
4568	1	4363	\N
4569	1	4364	\N
4570	1	4365	\N
4571	1	4366	\N
4572	1	4367	\N
4573	1	4368	\N
4574	1	4369	\N
4575	1	4370	\N
4576	1	4371	\N
4577	1	4372	\N
4578	1	4373	\N
4579	1	4374	\N
4580	1	4375	\N
4581	1	4376	\N
4582	1	4377	\N
4583	1	4378	\N
4584	1	4308	\N
4585	1	4380	\N
4586	1	4381	\N
4587	1	4382	\N
4588	1	4383	\N
4589	1	4384	\N
4590	1	4385	\N
4591	1	4386	\N
4592	1	4387	\N
4593	1	4388	\N
4594	1	4389	\N
4595	1	4326	\N
4596	1	4335	\N
4597	1	4390	\N
4598	1	4391	\N
4599	1	4392	\N
4600	1	4393	\N
4601	1	4394	\N
4602	1	4395	\N
4603	1	4396	\N
4604	1	4397	\N
4605	1	4398	\N
4606	1	4399	\N
4607	1	4400	\N
4608	1	4401	\N
4609	1	4402	\N
4610	1	4403	\N
4611	1	4404	\N
4612	1	4405	\N
4613	1	4406	\N
4614	1	4407	\N
4615	1	4408	\N
4616	1	4409	\N
4617	1	4410	\N
4618	1	4411	\N
4619	1	4412	\N
4620	1	4413	\N
4621	1	4414	\N
4622	1	4415	\N
4623	1	4416	\N
4624	1	4417	\N
4625	1	4418	\N
4626	1	4419	\N
4627	1	4420	\N
4628	1	4421	\N
4629	1	4422	\N
4630	1	4423	\N
4631	1	4424	\N
4632	1	4425	\N
4633	1	4426	\N
4634	1	4427	\N
4635	1	4428	\N
4636	1	4429	\N
4637	1	4430	\N
4638	1	4431	\N
4639	1	4432	\N
4640	1	4433	\N
4641	1	4434	\N
4642	1	4435	\N
4643	1	4436	\N
4644	1	4437	\N
4645	1	4438	\N
4646	1	4439	\N
4647	1	4440	\N
4648	1	4441	\N
4649	1	4442	\N
4650	1	4443	\N
4651	1	4444	\N
4652	1	4445	\N
4653	1	4446	\N
4654	1	4447	\N
4655	1	4449	\N
4656	1	4450	\N
4657	1	4451	\N
4658	1	4452	\N
4659	1	4453	\N
4660	1	4454	\N
4661	1	4455	\N
4662	1	4456	\N
4663	1	4457	\N
4664	1	4458	\N
4665	1	4459	\N
4666	1	4460	\N
4667	1	4461	\N
4668	1	4462	\N
4669	1	4463	\N
4670	1	4464	\N
4671	1	4465	\N
4672	1	4466	\N
4673	1	4467	\N
4674	1	4468	\N
4675	1	4469	\N
4676	1	4470	\N
4677	1	4471	\N
4678	1	4472	\N
4679	1	4473	\N
4680	1	4474	\N
4681	1	4475	\N
4682	1	4476	\N
4683	1	4477	\N
4684	1	4478	\N
4685	1	4479	\N
4686	1	4480	\N
4687	1	4481	\N
4688	1	4482	\N
4689	1	4483	\N
4690	1	4484	\N
4691	1	4485	\N
4692	1	4486	\N
4693	1	4487	\N
4694	1	4488	\N
4695	1	4489	\N
4696	1	4490	\N
4697	1	4491	\N
4698	1	4492	\N
4699	1	4493	\N
4700	1	4494	\N
4701	1	4496	\N
4702	1	4497	\N
4703	1	4498	\N
4704	1	4499	\N
4705	1	4500	\N
4706	1	4501	\N
4707	1	4502	\N
4708	1	4503	\N
4709	1	4504	\N
4710	1	4506	\N
4711	1	4507	\N
4712	1	4508	\N
4713	1	4509	\N
4714	1	4510	\N
4715	1	4511	\N
4716	1	4512	\N
4717	1	4513	\N
4718	1	4514	\N
4719	1	4516	\N
4720	1	4517	\N
4721	1	4518	\N
4722	1	4519	\N
4723	1	4520	\N
4724	1	4521	\N
4725	1	4522	\N
4726	1	4523	\N
4727	1	4524	\N
4728	1	4525	\N
4729	1	4526	\N
4730	1	4527	\N
4731	1	4528	\N
4732	1	4529	\N
4733	1	4530	\N
4734	1	4531	\N
4735	1	4532	\N
4736	1	4533	\N
4737	1	4534	\N
4738	1	4535	\N
4739	1	4536	\N
4740	1	4537	\N
4741	1	4538	\N
4742	1	4539	\N
4743	1	4540	\N
4744	1	4541	\N
4745	1	4543	\N
4746	1	4544	\N
4747	1	4545	\N
4748	1	4546	\N
4749	1	4547	\N
4750	1	4548	\N
4751	1	4549	\N
4752	1	4550	\N
4753	1	4552	\N
4754	1	4553	\N
4755	1	4554	\N
4756	1	4555	\N
4757	1	4556	\N
4758	1	4557	\N
4759	1	4558	\N
4760	1	4559	\N
4761	1	4560	\N
4762	1	4561	\N
4763	1	4562	\N
4764	1	4563	\N
4765	1	4564	\N
4766	1	4565	\N
4767	1	4566	\N
4768	1	4567	\N
4769	1	4568	\N
4770	1	4569	\N
4771	1	4570	\N
4772	1	4571	\N
4773	1	4572	\N
4774	1	4573	\N
4775	1	4574	\N
4776	1	4575	\N
4777	1	4576	\N
4778	1	4577	\N
4779	1	4578	\N
4780	1	4579	\N
4781	1	4580	\N
4782	1	4581	\N
4783	1	4582	\N
4784	1	4583	\N
4785	1	4584	\N
4786	1	4585	\N
4787	1	4586	\N
4788	1	4587	\N
4789	1	4588	\N
4790	1	4589	\N
4791	1	4590	\N
4792	1	4591	\N
4793	1	4592	\N
4794	1	4593	\N
4795	1	4594	\N
4796	1	4595	\N
4797	1	4596	\N
4798	1	4597	\N
4799	1	4598	\N
4800	1	4599	\N
4801	1	4600	\N
4802	1	4602	\N
4803	1	4603	\N
4804	1	4604	\N
4805	1	4605	\N
4806	1	4606	\N
4807	1	4607	\N
4808	1	4608	\N
4809	1	4609	\N
4810	1	4610	\N
4811	1	4612	\N
4812	1	4613	\N
4813	1	4614	\N
4814	1	4615	\N
4815	1	4616	\N
4816	1	4617	\N
4817	1	4618	\N
4818	1	4619	\N
4819	1	4620	\N
4820	1	4622	\N
4821	1	4623	\N
4822	1	4624	\N
4823	1	4625	\N
4824	1	4626	\N
4825	1	4627	\N
4826	1	4628	\N
4827	1	4629	\N
4828	1	4630	\N
4829	1	4632	\N
4830	1	4633	\N
4831	1	4634	\N
4832	1	4635	\N
4833	1	4636	\N
4834	1	4637	\N
4835	1	4638	\N
4836	1	4639	\N
4837	1	4640	\N
4838	1	4601	\N
4839	1	4642	\N
4840	1	4643	\N
4841	1	4644	\N
4842	1	4645	\N
4843	1	4646	\N
4844	1	4647	\N
4845	1	4648	\N
4846	1	4649	\N
4847	1	4650	\N
4848	1	4651	\N
4849	1	4652	\N
4850	1	4653	\N
4851	1	4654	\N
4852	1	4655	\N
4853	1	4656	\N
4854	1	4657	\N
4855	1	4658	\N
4856	1	4659	\N
4857	1	4660	\N
4858	1	4661	\N
4859	1	4662	\N
4860	1	4663	\N
4861	1	4664	\N
4862	1	4665	\N
4863	1	4666	\N
4864	1	4667	\N
4865	1	4668	\N
4866	1	4669	\N
4867	1	4670	\N
4868	1	4672	\N
4869	1	4673	\N
4870	1	4674	\N
4871	1	4675	\N
4872	1	4676	\N
4873	1	4677	\N
4874	1	4678	\N
4875	1	4679	\N
4876	1	4680	\N
4877	1	4682	\N
4878	1	4683	\N
4879	1	4684	\N
4880	1	4685	\N
4881	1	4686	\N
4882	1	4687	\N
4883	1	4688	\N
4884	1	4689	\N
4885	1	4691	\N
4886	1	4692	\N
4887	1	4693	\N
4888	1	4694	\N
4889	1	4695	\N
4890	1	4696	\N
4891	1	4697	\N
4892	1	4698	\N
4893	1	4699	\N
4894	1	4690	\N
4895	1	4701	\N
4896	1	4702	\N
4897	1	4703	\N
4898	1	4704	\N
4899	1	4705	\N
4900	1	4706	\N
4901	1	4707	\N
4902	1	4708	\N
4903	1	4709	\N
4904	1	4710	\N
4905	1	4711	\N
4906	1	4712	\N
4907	1	4713	\N
4908	1	4714	\N
4909	1	4715	\N
4910	1	4716	\N
4911	1	4717	\N
4912	1	4718	\N
4913	1	4719	\N
4914	1	4721	\N
4915	1	4722	\N
4916	1	4723	\N
4917	1	4724	\N
4918	1	4725	\N
4919	1	4726	\N
4920	1	4727	\N
4921	1	4728	\N
4922	1	4729	\N
4923	1	4731	\N
4924	1	4732	\N
4925	1	4733	\N
4926	1	4734	\N
4927	1	4735	\N
4928	1	4736	\N
4929	1	4737	\N
4930	1	4738	\N
4931	1	4739	\N
4932	1	4741	\N
4933	1	4742	\N
4934	1	4743	\N
4935	1	4744	\N
4936	1	4745	\N
4937	1	4746	\N
4938	1	4747	\N
4939	1	4748	\N
4940	1	4749	\N
4941	1	4751	\N
4942	1	4752	\N
4943	1	4753	\N
4944	1	4754	\N
4945	1	4755	\N
4946	1	4756	\N
4947	1	4757	\N
4948	1	4758	\N
4949	1	4759	\N
4950	1	4760	\N
4951	1	4761	\N
4952	1	4762	\N
4953	1	4763	\N
4954	1	4764	\N
4955	1	4765	\N
4956	1	4766	\N
4957	1	4767	\N
4958	1	4768	\N
4959	1	4769	\N
4960	1	4771	\N
4961	1	4772	\N
4962	1	4773	\N
4963	1	4774	\N
4964	1	4775	\N
4965	1	4776	\N
4966	1	4777	\N
4967	1	4778	\N
4968	1	4779	\N
4969	1	4750	\N
4970	1	4780	\N
4971	1	4781	\N
4972	1	4782	\N
4973	1	4783	\N
4974	1	4784	\N
4975	1	4785	\N
4976	1	4786	\N
4977	1	4787	\N
4978	1	4788	\N
4979	1	4789	\N
4980	1	4790	\N
4981	1	4791	\N
4982	1	4792	\N
4983	1	4793	\N
4984	1	4794	\N
4985	1	4795	\N
4986	1	4796	\N
4987	1	4797	\N
4988	1	4798	\N
4989	1	4799	\N
4990	1	4800	\N
4991	1	4801	\N
4992	1	4802	\N
4993	1	4803	\N
4994	1	4804	\N
4995	1	4805	\N
4996	1	4806	\N
4997	1	4807	\N
4998	1	4808	\N
4999	1	4809	\N
5000	1	4810	\N
5001	1	4811	\N
5002	1	4812	\N
5003	1	4813	\N
5004	1	4814	\N
5005	1	4815	\N
5006	1	4816	\N
5007	1	4817	\N
5008	1	4818	\N
5009	1	4819	\N
5010	1	4820	\N
5011	1	4821	\N
5012	1	4822	\N
5013	1	4823	\N
5014	1	4824	\N
5015	1	4825	\N
5016	1	4826	\N
5017	1	4827	\N
5018	1	4828	\N
5019	1	4830	\N
5020	1	4831	\N
5021	1	4832	\N
5022	1	4833	\N
5023	1	4834	\N
5024	1	4835	\N
5025	1	4836	\N
5026	1	4837	\N
5027	1	4838	\N
5028	1	4839	\N
5029	1	4840	\N
5030	1	4841	\N
5031	1	4842	\N
5032	1	4843	\N
5033	1	4844	\N
5034	1	4845	\N
5035	1	4846	\N
5036	1	4847	\N
5037	1	4848	\N
5038	1	4849	\N
5039	1	4850	\N
5040	1	4851	\N
5041	1	4852	\N
5042	1	4853	\N
5043	1	4854	\N
5044	1	4855	\N
5045	1	4857	\N
5046	1	4858	\N
5047	1	4859	\N
5048	1	4860	\N
5049	1	4861	\N
5050	1	4862	\N
5051	1	4863	\N
5052	1	4864	\N
5053	1	4866	\N
5054	1	4867	\N
5055	1	4868	\N
5056	1	4869	\N
5057	1	4870	\N
5058	1	4871	\N
5059	1	4872	\N
5060	1	4873	\N
5061	1	4875	\N
5062	1	4876	\N
5063	1	4877	\N
5064	1	4878	\N
5065	1	4879	\N
5066	1	4880	\N
5067	1	4881	\N
5068	1	4882	\N
5069	1	4884	\N
5070	1	4885	\N
5071	1	4886	\N
5072	1	4887	\N
5073	1	4888	\N
5074	1	4889	\N
5075	1	4890	\N
5076	1	4891	\N
5077	1	4892	\N
5078	1	4894	\N
5079	1	4895	\N
5080	1	4896	\N
5081	1	4897	\N
5082	1	4898	\N
5083	1	4899	\N
5084	1	4900	\N
5085	1	4901	\N
5086	1	4902	\N
5087	1	4903	\N
5088	1	4904	\N
5089	1	4905	\N
5090	1	4906	\N
5091	1	4907	\N
5092	1	4908	\N
5093	1	4909	\N
5094	1	4910	\N
5095	1	4911	\N
5096	1	4912	\N
5097	1	4914	\N
5098	1	4915	\N
5099	1	4916	\N
5100	1	4917	\N
5101	1	4918	\N
5102	1	4919	\N
5103	1	4920	\N
5104	1	4921	\N
5105	1	4922	\N
5106	1	4924	\N
5107	1	4925	\N
5108	1	4926	\N
5109	1	4927	\N
5110	1	4928	\N
5111	1	4929	\N
5112	1	4930	\N
5113	1	4931	\N
5114	1	4933	\N
5115	1	4934	\N
5116	1	4935	\N
5117	1	4936	\N
5118	1	4937	\N
5119	1	4938	\N
5120	1	4939	\N
5121	1	4940	\N
5122	1	4942	\N
5123	1	4943	\N
5124	1	4944	\N
5125	1	4945	\N
5126	1	4946	\N
5127	1	4947	\N
5128	1	4948	\N
5129	1	4949	\N
5130	1	4951	\N
5131	1	4952	\N
5132	1	4953	\N
5133	1	4954	\N
5134	1	4955	\N
5135	1	4956	\N
5136	1	4957	\N
5137	1	4958	\N
5138	1	4959	\N
5139	1	4932	\N
5140	1	4941	\N
5141	1	4950	\N
5142	1	4960	\N
5143	1	4961	\N
5144	1	4962	\N
5145	1	4963	\N
5146	1	4964	\N
5147	1	4965	\N
5148	1	4966	\N
5149	1	4967	\N
5150	1	4968	\N
5151	1	4969	\N
5152	1	4883	\N
5153	1	4970	\N
5154	1	4971	\N
5155	1	4972	\N
5156	1	4973	\N
5157	1	4974	\N
5158	1	4975	\N
5159	1	4976	\N
5160	1	4977	\N
5161	1	4978	\N
5162	1	4979	\N
5163	1	4980	\N
5164	1	4981	\N
5165	1	4982	\N
5166	1	4983	\N
5167	1	4984	\N
5168	1	4985	\N
5169	1	4986	\N
5170	1	4987	\N
5171	1	4988	\N
5172	1	4989	\N
5173	1	4448	\N
5174	1	4611	\N
5175	1	4621	\N
5176	1	4856	\N
5177	1	4990	\N
5178	1	4991	\N
5179	1	4992	\N
5180	1	4993	\N
5181	1	4994	\N
5182	1	4995	\N
5183	1	4996	\N
5184	1	4997	\N
5185	1	4998	\N
5186	1	4999	\N
5187	1	5001	\N
5188	1	5002	\N
5189	1	5003	\N
5190	1	5004	\N
5191	1	5005	\N
5192	1	5006	\N
5193	1	5007	\N
5194	1	5008	\N
5195	1	5009	\N
5196	1	5010	\N
5197	1	5012	\N
5198	1	5013	\N
5199	1	5014	\N
5200	1	5015	\N
5201	1	5016	\N
5202	1	5017	\N
5203	1	5018	\N
5204	1	5019	\N
5205	1	5020	\N
5206	1	5021	\N
5207	1	5023	\N
5208	1	5024	\N
5209	1	5025	\N
5210	1	5026	\N
5211	1	5027	\N
5212	1	5028	\N
5213	1	5029	\N
5214	1	5030	\N
5215	1	5031	\N
5216	1	5032	\N
5217	1	5034	\N
5218	1	5035	\N
5219	1	5036	\N
5220	1	5037	\N
5221	1	5038	\N
5222	1	5039	\N
5223	1	5040	\N
5224	1	5041	\N
5225	1	5042	\N
5226	1	5043	\N
5227	1	5045	\N
5228	1	5046	\N
5229	1	5047	\N
5230	1	5048	\N
5231	1	5049	\N
5232	1	5050	\N
5233	1	5051	\N
5234	1	5052	\N
5235	1	5053	\N
5236	1	5054	\N
5237	1	5055	\N
5238	1	5056	\N
5239	1	5057	\N
5240	1	5058	\N
5241	1	5059	\N
5242	1	5060	\N
5243	1	5061	\N
5244	1	5062	\N
5245	1	5063	\N
5246	1	5064	\N
5247	1	5065	\N
5248	1	5066	\N
5249	1	5067	\N
5250	1	5068	\N
5251	1	5069	\N
5252	1	5070	\N
5253	1	5071	\N
5254	1	5072	\N
5255	1	5073	\N
5256	1	5074	\N
5257	1	5075	\N
5258	1	5076	\N
5259	1	5077	\N
5260	1	5078	\N
5261	1	5079	\N
5262	1	5080	\N
5263	1	5081	\N
5264	1	5082	\N
5265	1	5083	\N
5266	1	5084	\N
5267	1	5085	\N
5268	1	5086	\N
5269	1	5087	\N
5270	1	5088	\N
5271	1	5089	\N
5272	1	5090	\N
5273	1	5091	\N
5274	1	5092	\N
5275	1	5093	\N
5276	1	5094	\N
5277	1	5095	\N
5278	1	5096	\N
5279	1	5097	\N
5280	1	5098	\N
5281	1	5099	\N
5282	1	5100	\N
5283	1	5101	\N
5284	1	5102	\N
5285	1	5103	\N
5286	1	5104	\N
5287	1	5105	\N
5288	1	5106	\N
5289	1	5107	\N
5290	1	5108	\N
5291	1	5109	\N
5292	1	5110	\N
5293	1	5111	\N
5294	1	5112	\N
5295	1	5113	\N
5296	1	5114	\N
5297	1	5115	\N
5298	1	5116	\N
5299	1	5117	\N
5300	1	5118	\N
5301	1	5119	\N
5302	1	5120	\N
5303	1	5121	\N
5304	1	5122	\N
5305	1	5123	\N
5306	1	5124	\N
5307	1	5125	\N
5308	1	5126	\N
5309	1	5127	\N
5310	1	5128	\N
5311	1	5129	\N
5312	1	5130	\N
5313	1	5131	\N
5314	1	5132	\N
5315	1	5133	\N
5316	1	5134	\N
5317	1	5135	\N
5318	1	5136	\N
5319	1	5137	\N
5320	1	5138	\N
5321	1	5139	\N
5322	1	5140	\N
5323	1	5141	\N
5324	1	5142	\N
5325	1	5143	\N
5326	1	5144	\N
5327	1	5145	\N
5328	1	5146	\N
5329	1	5147	\N
5330	1	5148	\N
5331	1	5149	\N
5332	1	5150	\N
5333	1	5151	\N
5334	1	5152	\N
5335	1	5153	\N
5336	1	5154	\N
5337	1	5155	\N
5338	1	5156	\N
5339	1	5157	\N
5340	1	5158	\N
5341	1	5159	\N
5342	1	5160	\N
5343	1	5161	\N
5344	1	5162	\N
5345	1	5163	\N
5346	1	5164	\N
5347	1	5165	\N
5348	1	5166	\N
5349	1	5167	\N
5350	1	5168	\N
5351	1	5169	\N
5352	1	5170	\N
5353	1	5171	\N
5354	1	5172	\N
5355	1	5173	\N
5356	1	5174	\N
5357	1	5175	\N
5358	1	5176	\N
5359	1	5177	\N
5360	1	5178	\N
5361	1	5179	\N
5362	1	5180	\N
5363	1	5181	\N
5364	1	5182	\N
5365	1	5183	\N
5366	1	5184	\N
5367	1	5185	\N
5368	1	5186	\N
5369	1	5187	\N
5370	1	5188	\N
5371	1	5189	\N
5372	1	5190	\N
5373	1	5191	\N
5374	1	5192	\N
5375	1	5193	\N
5376	1	5194	\N
5377	1	5195	\N
5378	1	5196	\N
5379	1	5197	\N
5380	1	5198	\N
5381	1	5199	\N
5382	1	5200	\N
5383	1	5201	\N
5384	1	5202	\N
5385	1	5203	\N
5386	1	5204	\N
5387	1	5205	\N
5388	1	5206	\N
5389	1	5207	\N
5390	1	5208	\N
5391	1	5209	\N
5392	1	5210	\N
5393	1	5211	\N
5394	1	5212	\N
5395	1	5213	\N
5396	1	5214	\N
5397	1	5215	\N
5398	1	5216	\N
5399	1	5217	\N
5400	1	5218	\N
5401	1	5219	\N
5402	1	5220	\N
5403	1	5221	\N
5404	1	5222	\N
5405	1	5223	\N
5406	1	5224	\N
5407	1	4874	\N
5408	1	2692	\N
5409	1	3367	\N
5410	1	3414	\N
5411	1	3597	\N
5412	1	3834	\N
5413	1	4142	\N
5414	1	4152	\N
5415	1	4252	\N
5416	1	4262	\N
5417	1	4631	\N
5418	1	4641	\N
5419	1	4700	\N
5420	1	4720	\N
5421	1	5225	\N
5422	1	5226	\N
5423	1	5227	\N
5424	1	5228	\N
5425	1	5229	\N
5426	1	5230	\N
5427	1	5231	\N
5428	1	5232	\N
5429	1	5233	\N
5430	1	5234	\N
5431	1	5235	\N
5432	1	5237	\N
5433	1	5238	\N
5434	1	5239	\N
5435	1	5240	\N
5436	1	5241	\N
5437	1	5242	\N
5438	1	5243	\N
5439	1	5244	\N
5440	1	5245	\N
5441	1	5246	\N
5442	1	5247	\N
5443	1	5249	\N
5444	1	5250	\N
5445	1	5251	\N
5446	1	5252	\N
5447	1	5253	\N
5448	1	5254	\N
5449	1	5255	\N
5450	1	5256	\N
5451	1	5257	\N
5452	1	5258	\N
5453	1	5259	\N
5454	1	5261	\N
5455	1	5262	\N
5456	1	5263	\N
5457	1	5264	\N
5458	1	5265	\N
5459	1	5266	\N
5460	1	5267	\N
5461	1	5268	\N
5462	1	5269	\N
5463	1	5270	\N
5464	1	5271	\N
5465	1	5273	\N
5466	1	5274	\N
5467	1	5275	\N
5468	1	5276	\N
5469	1	5277	\N
5470	1	5278	\N
5471	1	5279	\N
5472	1	5280	\N
5473	1	5281	\N
5474	1	5282	\N
5475	1	5283	\N
5476	1	5284	\N
5477	1	5285	\N
5478	1	5286	\N
5479	1	5287	\N
5480	1	5288	\N
5481	1	5289	\N
5482	1	5290	\N
5483	1	5291	\N
5484	1	5292	\N
5485	1	5293	\N
5486	1	5294	\N
5487	1	5295	\N
5488	1	5296	\N
5489	1	5297	\N
5490	1	5298	\N
5491	1	5299	\N
5492	1	5300	\N
5493	1	5301	\N
5494	1	5302	\N
5495	1	5303	\N
5496	1	5304	\N
5497	1	5305	\N
5498	1	5306	\N
5499	1	5307	\N
5500	1	5308	\N
5501	1	5309	\N
5502	1	5310	\N
5503	1	5311	\N
5504	1	5312	\N
5505	1	5313	\N
5506	1	5314	\N
5507	1	5315	\N
5508	1	5316	\N
5509	1	5317	\N
5510	1	5318	\N
5511	1	5319	\N
5512	1	5320	\N
5513	1	5321	\N
5514	1	5322	\N
5515	1	5323	\N
5516	1	5324	\N
5517	1	5325	\N
5518	1	5326	\N
5519	1	5327	\N
5520	1	5328	\N
5521	1	5329	\N
5522	1	5330	\N
5523	1	5331	\N
5524	1	5332	\N
5525	1	5333	\N
5526	1	5334	\N
5527	1	5335	\N
5528	1	5336	\N
5529	1	5337	\N
5530	1	5338	\N
5531	1	5339	\N
5532	1	5340	\N
5533	1	5341	\N
5534	1	5342	\N
5535	1	5343	\N
5536	1	5536	\N
5537	2	5538	\N
5538	2	5537	\N
5539	2	5539	\N
5540	3	5540	\N
5541	3	5541	\N
5542	4	5548	\N
5543	4	5542	\N
5544	4	5549	\N
5545	4	5543	\N
5546	4	5544	\N
5547	4	5545	\N
5548	4	5551	\N
5549	4	5546	\N
5550	4	5552	\N
5551	4	5547	\N
5552	4	5550	\N
5553	5	5553	\N
5554	5	5555	\N
5555	5	5554	\N
5556	6	5556	\N
5557	6	5557	\N
5558	7	5561	\N
5559	7	5563	\N
5560	7	5560	\N
5561	7	5559	\N
5562	7	5562	\N
5563	7	5558	\N
5564	8	5564	\N
5565	8	5565	\N
5566	8	5567	\N
5567	8	5566	\N
5568	9	5568	\N
5569	9	5570	\N
5570	9	5569	\N
5571	10	5571	\N
5572	11	5572	\N
5573	11	5574	\N
5574	11	5573	\N
5575	12	5575	\N
5576	12	5576	\N
5577	13	5577	\N
5578	13	5578	\N
5579	13	5579	\N
5580	14	5580	\N
5581	15	5581	\N
5582	15	5582	\N
5583	16	5583	\N
5584	16	5585	\N
5585	16	5584	\N
5586	17	5586	\N
5587	17	5587	\N
5588	20	5589	\N
5589	21	5590	\N
5590	23	5591	\N
5591	24	5592	\N
5592	25	5548	{"geom": "0101000020E6100000010000007C765CC0C6ACC21B1A8B4240", "region": "Amargosa Desert E", "ecosystem": null}
5593	26	5594	\N
5594	28	5542	{"gid": 3, "geom": "0101000020E610000001000000AAC05CC0701E53612E5A4240", "qa_qc": null, "agency": null, "region": null, "audit_id": 5542, "comments": null, "gps_date": null, "ecosystem": null, "gps_photo": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "resto_acti": null, "resto_code": null, "secondary_": null, "sqft_resto": null}
5595	29	5595	\N
5596	31	5583	{"gid": 2, "geom": "0105000020E610000001000000010200000004000000010000009CEC5CC04AF77AAE991442400100000014A25CC033273AFE681B424001000000CCBC5CC001DD5593ECED41400100000090CB5CC0CDE4CC0674FA4140", "mulch": null, "qa_qc": null, "agency": 0, "region": "Hidden Valley S", "signed": null, "te_act": null, "audit_id": 5583, "comments": null, "gps_date": null, "km_resto": null, "deep_till": null, "ecosystem": "Riparian", "gps_photo": null, "resto_act": null, "barrier_in": null, "miles_rest": null, "monitoring": null, "nonlists_a": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "resto_code": null, "secondary_": null, "shape_leng": null, "shape_stle": null, "treatment_": null}
5597	33	5581	{"geom": "010500000001000000010200000004000000000000009CEC5CC04AF77AAE991442400000000014A25CC033273AFE681B424000000000CCBC5CC004DD5593ECED41400000000090CB5CC0C9E4CC0674FA4140", "agency": null, "region": "Hidden Valley S", "ecosystem": "Riparian"}
5598	34	5584	{"gid": 4523, "geom": "0105000020E6100000010000000102000000020000000100000062AE5CC0F19057FF235F424001000000E0E45CC07A487E7615634240", "mulch": null, "qa_qc": null, "agency": 0, "region": null, "signed": null, "te_act": null, "audit_id": 5584, "comments": null, "gps_date": null, "km_resto": null, "deep_till": null, "ecosystem": null, "gps_photo": null, "resto_act": null, "barrier_in": null, "miles_rest": null, "monitoring": null, "nonlists_a": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "resto_code": null, "secondary_": null, "shape_leng": null, "shape_stle": null, "treatment_": null}
5599	35	5597	\N
5600	37	5543	{"gid": 12, "geom": "0101000020E6100000010000005A7A5CC0D4CF3C75FA534240", "qa_qc": null, "agency": 2, "region": "Indian Springs Valley N", "audit_id": 5543, "comments": null, "gps_date": null, "ecosystem": null, "gps_photo": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "resto_acti": null, "resto_code": null, "secondary_": null, "sqft_resto": null}
5601	39	5538	{"geom": "010100000023000000B2C75CC0DB2FE44C6B894240", "region": "Greasewood Basin", "ecosystem": "Spring"}
5602	40	5544	{"gid": 13, "geom": "0101000020E610000001000000A8865CC00291B61C482B4240", "qa_qc": null, "agency": 1, "region": "Hidden Valley S", "audit_id": 5544, "comments": null, "gps_date": null, "ecosystem": null, "gps_photo": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "resto_acti": null, "resto_code": null, "secondary_": null, "sqft_resto": null}
5603	41	5599	\N
5604	43	5540	{"te_action": null, "non_list_a": null}
5605	44	5591	{"gid": 1, "geom": null, "qa_qc": null, "agency": 2, "barr_km": null, "regions": null, "audit_id": 5591, "comments": null, "gps_date": null, "barr_code": null, "barr_type": null, "ecosystem": null, "gps_photo": null, "barr_actio": null, "barr_miles": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "secondary_": null, "shape_leng": null, "shape_stle": null}
5606	45	5600	\N
5607	46	5600	{"gid": 3, "geom": null, "qa_qc": null, "agency": 0, "barr_km": null, "regions": null, "audit_id": 5600, "comments": null, "gps_date": null, "barr_code": null, "barr_type": null, "ecosystem": null, "gps_photo": null, "barr_actio": null, "barr_miles": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "secondary_": null, "shape_leng": null, "shape_stle": null}
5608	47	5601	\N
5609	49	5602	\N
5610	48	5603	\N
5611	54	5590	{"agency": 2, "regions": null, "gps_date": null, "ecosystem": null}
5612	61	5590	{"agency": 1, "regions": "Amargosa Desert E", "gps_date": "2018-03-02"}
5613	62	5590	{"agency": 3}
5614	63	5604	\N
5615	65	5599	{"gid": 2, "geom": "0105000020E610000001000000010200000003000000000070FF0DB15CC0623CA45566934240010070FF357A5CC0E5705D091D77424001000000966B5CC06B0978873D094240", "qa_qc": null, "agency": 1, "barr_km": null, "regions": "Amargosa Desert W", "audit_id": 5599, "comments": null, "gps_date": "2018-02-02", "barr_code": null, "barr_type": null, "ecosystem": "Bristlecone/ Limber Pine", "gps_photo": null, "barr_actio": null, "barr_miles": null, "photo_azim": null, "previously": null, "primary_ob": null, "project_na": null, "secondary_": null, "shape_leng": null, "shape_stle": null}
5616	66	5601	{"agency": 1}
5617	67	5601	{"agency": 0}
5618	77	5556	{"agency": 2}
5619	80	5601	{"agency": 2, "regions": "Black Mt Area"}
5620	81	5605	\N
5621	83	5606	\N
5622	85	5607	\N
5623	87	5608	\N
5624	89	5607	{"gid": 1, "geom": "0106000020E6100000010000000103000000010000001300000001000000EE5E5CC0431585B93BC041400100B8FF25515CC06FAB8EA0C2CA4140010070FF75585CC0624A574485E2414001004800AE655CC08F51FD65DEDE4140020028FF6D6C5CC0724F4D7A5CCC41400100000036715CC098F611711CBC414001004800E6695CC035DF1AB091B1414001004800AE655CC035DF1AB091B14140000070FFAD5C5CC04E50DFDBF1B241400100B8FF5D555CC09D4B5C3C67B34140020028FF45495CC023FCBA050CA14140010070FF75585CC089154122848A4140010070FFFD485CC0F6A080224B874140010000009E455CC0B0CE2D4B0E8A414001000000FE3F5CC05385CCA9C6984140000028FF9D3C5CC0F04CAD25B0AA4140020028FFA5435CC081AE406987B741400200E0FE65535CC0634930F181BA414001000000EE5E5CC0431585B93BC04140", "depth": null, "qa_qc": null, "agency": 1, "regions": "Black Mt Area", "treated": null, "audit_id": 5607, "comments": null, "cultural": null, "dist_use": null, "gps_date": "2018-02-12", "use_freq": null, "dist_code": "FS-20180212-161658", "ecosystem": null, "gps_photo": null, "acres_rest": null, "assessibil": null, "dist_crust": null, "dist_poly_": null, "dist_sever": null, "kmsq_resto": null, "old_distco": null, "photo_azim": null, "plant_dama": null, "primary_ob": "dasd", "secondary_": null, "shape_area": null, "shape_leng": null, "shape_star": null, "shape_stle": null, "site_stabi": null, "site_vulne": null, "t_e_specie": null, "undist_cru": null, "use_recent": null, "visibility": null}
5625	92	5611	\N
5626	95	5549	{"geom": "0101000020E610000001000000F0985CC09F1AF21E9D864240", "gps_date": null, "ecosystem": "Mixed Conifer", "primary_ob": null, "resto_acti": null, "resto_code": null}
5627	94	5553	{"geom": "0106000020E610000001000000010300000001000000080000000100000018E95CC0E7B4749D32A4424001000000E0B75CC05610607D03BF4240010000000CC85CC01EDF31FDC2964240010000008CDE5CC0646FF0DCD69242400100000048B95CC0EF3D5B1C9A2A42400100000028CA5CC089ED7A3366E64140010000006CEF5CC0BEBA421E566542400100000018E95CC0E7B4749D32A44240", "agency": 2, "region": "Amargosa Desert W", "gps_date": null, "primary_ob": null, "resto_code": null}
5628	92	5612	\N
5629	96	5613	\N
\.


--
-- Data for Name: table_event_log; Type: TABLE DATA; Schema: pgmemento; Owner: ubuntu
--

COPY table_event_log (id, transaction_id, op_id, table_operation, table_relid) FROM stdin;
1	1038	3	INSERT	16686
2	1038	3	INSERT	18037
3	1038	3	INSERT	18051
4	1038	3	INSERT	18045
5	1038	3	INSERT	18059
6	1038	3	INSERT	17903
7	1038	3	INSERT	17925
8	1038	3	INSERT	17947
9	1038	3	INSERT	17939
10	1038	3	INSERT	17953
11	1038	3	INSERT	17969
12	1038	3	INSERT	17961
13	1038	3	INSERT	17933
14	1038	3	INSERT	18015
15	1038	3	INSERT	18023
16	1038	3	INSERT	18031
17	1046	3	INSERT	18059
18	1046	4	UPDATE	18059
20	1048	3	INSERT	17903
21	1049	3	INSERT	17903
23	1070	3	INSERT	17911
24	1071	3	INSERT	18045
25	1071	4	UPDATE	18045
26	1072	3	INSERT	18037
27	1072	4	UPDATE	18037
28	1073	7	DELETE	18045
29	1074	3	INSERT	18023
30	1074	4	UPDATE	18023
31	1075	7	DELETE	18031
32	1076	3	INSERT	18023
33	1076	4	UPDATE	18023
34	1077	7	DELETE	18031
35	1078	3	INSERT	18037
36	1078	4	UPDATE	18037
37	1079	7	DELETE	18045
38	1080	3	INSERT	18037
39	1080	4	UPDATE	18037
40	1081	7	DELETE	18045
41	1082	3	INSERT	17911
42	1082	4	UPDATE	17911
43	1083	4	UPDATE	18051
44	1084	7	DELETE	17911
45	1085	3	INSERT	17911
46	1086	7	DELETE	17911
47	1087	3	INSERT	17911
48	1088	3	INSERT	17947
49	1089	3	INSERT	18045
50	1087	4	UPDATE	17911
51	1089	4	UPDATE	18045
52	1088	4	UPDATE	17947
53	1090	4	UPDATE	17903
54	1091	4	UPDATE	17903
55	1092	4	UPDATE	17903
56	1093	4	UPDATE	17903
57	1094	4	UPDATE	18037
58	1095	4	UPDATE	18037
59	1096	4	UPDATE	18037
60	1097	4	UPDATE	18037
61	1098	4	UPDATE	17903
62	1099	4	UPDATE	17903
63	1100	3	INSERT	17903
64	1100	4	UPDATE	17903
65	1101	7	DELETE	17911
66	1102	4	UPDATE	17911
67	1103	4	UPDATE	17911
68	1104	4	UPDATE	17903
69	1105	4	UPDATE	17903
70	1106	4	UPDATE	17903
71	1107	4	UPDATE	17903
72	1108	4	UPDATE	17903
73	1109	4	UPDATE	17903
74	1110	4	UPDATE	17903
75	1111	4	UPDATE	17903
76	1112	4	UPDATE	17903
77	1113	4	UPDATE	17903
78	1114	4	UPDATE	17903
79	1115	4	UPDATE	17903
80	1116	4	UPDATE	17911
81	1117	3	INSERT	18045
82	1117	4	UPDATE	18045
83	1118	3	INSERT	17947
84	1118	4	UPDATE	17947
85	1119	3	INSERT	17969
86	1119	4	UPDATE	17969
87	1120	3	INSERT	17961
88	1120	4	UPDATE	17961
89	1121	7	DELETE	17969
90	1183	3	INSERT	18059
91	1184	3	INSERT	18045
92	1182	3	INSERT	18031
93	1182	4	UPDATE	18031
94	1183	4	UPDATE	18059
95	1184	4	UPDATE	18045
96	1185	3	INSERT	18045
97	1185	4	UPDATE	18045
\.


--
-- Data for Name: transaction_log; Type: TABLE DATA; Schema: pgmemento; Owner: ubuntu
--

COPY transaction_log (id, txid, stmt_date, user_name, client_name) FROM stdin;
1	1038	2018-02-01 07:33:48.019229+00	ubuntu	\N
17	1046	2018-02-01 22:50:01.946643+00	postgres	127.0.0.1/32
20	1048	2018-02-02 04:15:46.954083+00	ubuntu	\N
21	1049	2018-02-02 04:16:07.654632+00	ubuntu	\N
23	1070	2018-02-02 05:13:28.812149+00	postgres	\N
24	1071	2018-02-02 06:12:20.630684+00	postgres	127.0.0.1/32
26	1072	2018-02-02 09:30:43.199183+00	postgres	127.0.0.1/32
28	1073	2018-02-02 09:30:43.219311+00	postgres	127.0.0.1/32
29	1074	2018-02-02 09:53:59.405581+00	postgres	127.0.0.1/32
31	1075	2018-02-02 09:53:59.439159+00	postgres	127.0.0.1/32
32	1076	2018-02-02 10:06:01.41125+00	postgres	127.0.0.1/32
34	1077	2018-02-02 10:06:01.43442+00	postgres	127.0.0.1/32
35	1078	2018-02-02 10:07:24.381776+00	postgres	127.0.0.1/32
37	1079	2018-02-02 10:07:24.401446+00	postgres	127.0.0.1/32
38	1080	2018-02-02 10:07:28.652937+00	postgres	127.0.0.1/32
40	1081	2018-02-02 10:07:28.66012+00	postgres	127.0.0.1/32
41	1082	2018-02-02 10:23:47.963939+00	postgres	127.0.0.1/32
43	1083	2018-02-10 19:28:08.997436+00	postgres	127.0.0.1/32
44	1084	2018-02-10 20:11:43.615327+00	ubuntu	\N
45	1085	2018-02-10 20:12:24.016669+00	ubuntu	\N
46	1086	2018-02-10 20:12:42.798584+00	ubuntu	\N
47	1087	2018-02-10 20:47:21.38726+00	postgres	127.0.0.1/32
49	1088	2018-02-10 20:47:21.388055+00	postgres	127.0.0.1/32
48	1089	2018-02-10 20:47:21.392526+00	postgres	127.0.0.1/32
53	1090	2018-02-10 20:47:43.415501+00	postgres	127.0.0.1/32
54	1091	2018-02-10 20:56:34.313421+00	postgres	127.0.0.1/32
55	1092	2018-02-10 20:58:42.867484+00	postgres	127.0.0.1/32
56	1093	2018-02-10 20:59:08.397186+00	postgres	127.0.0.1/32
57	1094	2018-02-10 21:00:11.181435+00	postgres	127.0.0.1/32
58	1095	2018-02-10 21:00:28.838245+00	postgres	127.0.0.1/32
59	1096	2018-02-10 21:00:41.04113+00	postgres	127.0.0.1/32
60	1097	2018-02-10 21:03:32.975646+00	postgres	127.0.0.1/32
61	1098	2018-02-10 21:03:42.46432+00	postgres	127.0.0.1/32
62	1099	2018-02-10 21:04:06.14323+00	postgres	127.0.0.1/32
63	1100	2018-02-10 21:09:27.795399+00	postgres	127.0.0.1/32
65	1101	2018-02-10 21:09:27.821114+00	postgres	127.0.0.1/32
66	1102	2018-02-10 21:17:42.931135+00	ubuntu	\N
67	1103	2018-02-10 21:18:34.887735+00	ubuntu	\N
68	1104	2018-02-10 21:20:05.686983+00	postgres	127.0.0.1/32
69	1105	2018-02-10 21:22:22.242656+00	postgres	127.0.0.1/32
70	1106	2018-02-10 21:23:52.495831+00	postgres	127.0.0.1/32
71	1107	2018-02-10 21:28:27.615822+00	postgres	127.0.0.1/32
72	1108	2018-02-10 21:28:45.962642+00	postgres	127.0.0.1/32
73	1109	2018-02-10 21:30:16.292447+00	postgres	127.0.0.1/32
74	1110	2018-02-10 21:31:39.133095+00	postgres	127.0.0.1/32
75	1111	2018-02-10 21:32:12.132372+00	postgres	127.0.0.1/32
76	1112	2018-02-10 21:33:16.464005+00	postgres	127.0.0.1/32
77	1113	2018-02-10 21:39:18.471803+00	postgres	127.0.0.1/32
78	1114	2018-02-10 21:47:59.538652+00	postgres	127.0.0.1/32
79	1115	2018-02-10 21:48:06.023744+00	postgres	127.0.0.1/32
80	1116	2018-02-10 21:49:08.658617+00	postgres	127.0.0.1/32
81	1117	2018-02-13 00:15:38.94279+00	postgres	127.0.0.1/32
83	1118	2018-02-13 00:16:18.084608+00	postgres	127.0.0.1/32
85	1119	2018-02-13 00:17:12.405609+00	postgres	127.0.0.1/32
87	1120	2018-02-13 00:17:23.96193+00	postgres	127.0.0.1/32
89	1121	2018-02-13 00:17:23.983619+00	postgres	127.0.0.1/32
92	1184	2018-03-01 06:21:27.608204+00	postgres	127.0.0.1/32
90	1182	2018-03-01 06:21:27.555117+00	postgres	127.0.0.1/32
91	1183	2018-03-01 06:21:27.555899+00	postgres	127.0.0.1/32
96	1185	2018-04-03 20:04:59.204774+00	postgres	127.0.0.1/32
\.


SET search_path = public, pg_catalog;

--
-- Data for Name: barrier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY barrier (gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type, comments, primary_ob, secondary_, project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc, shape_leng, geom, audit_id) FROM stdin;
14243	1	Amargosa Desert W	Pinon-Juniper	2018-01-19	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E610000001000000010200000002000000FDFF6FFF19785CC05D1902E23CAA424013004800026C5CC0E3E07ECA7D854240	5557
1	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5589
2	0	\N	Bristlecone/ Limber Pine	2018-02-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5590
3	1	Amargosa Desert W	Bristlecone/ Limber Pine	2018-02-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E610000001000000010200000003000000FDFF6FFF0DB15CC05B3CA45566934240FDFF6FFF357A5CC0E7705D091D77424023000000966B5CC06B0978873D094240	5604
87	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E610000001000000010200000003000000000000005C0E5DC08BFD8B8CEA4F424000000000D8B05CC0F0B37015B63C42400000000028435CC073487E7615634240	5556
\.


--
-- Data for Name: barrier_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY barrier_sub (gid, agency, regions, ecosystem, gps_date, barr_code, barr_actio, barr_type, comments, primary_ob, secondary_, project_na, barr_miles, barr_km, previously, gps_photo, photo_azim, qa_qc, shape_stle, shape_leng, geom, audit_id) FROM stdin;
4	0	\N	\N	2018-02-10	\N	\N	\N	\N	me	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E6100000010000000102000000030000000100B8FF3F275DC0F629F8D906AC4240000028FF27EE5CC0D29783DD55BC4240020028FF0FD95CC09CCBDA1151B84240	5601
\.


--
-- Data for Name: blm_regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY blm_regions (gid, objectid, area_, perimeter, ha750_2003, ha750_2004, hyd_area, hyd_area_n, subarea_na, hyd_region, hyd_regi_1, pltsym, desig, des_reas, scale, desig_orde, shape_leng, ird, ird_name, shape_le_1, shape_le_2, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: dist_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_line (gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments, primary_ob, secondary_, miles_dist, km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c, shape_leng, geom, audit_id) FROM stdin;
124124	0	Indian Springs Valley S	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010500000000000000	5558
1243	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	01050000000100000001020000000400000000000000B4D45CC08D7C750CA46B4240230000008AD15CC075BB29FB650642400000000020695CC033273AFE681B42400000000080BD5CC0CF1A4206564E4240	5559
324	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000000010000000102000000020000002300000062AE5CC0F39057FF235F424000000000E0E45CC073487E7615634240	5560
5	1	Hidden Valley N	Pinon-Juniper	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000000010000000102000000020000000000000084045DC0E76020FB706D42400000000004945CC0ECA1994438D34140	5561
1999	2	\N	\N	2012-07-17	401-DIS12-075-3370	Social	Yes	Yes	Unstable	0 - No Crust	0 - No Crust	\N	3 - 6 ft - Vehicle	Road	6 - Denuded	High	High	Datafile= , BioArea= spur off main dist.	K. Gulley and D. Thiell	\N	0.01633746	0.02629264	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	01050000000100000001020000000300000019DBA298B4F25CC0B7DF4A84A0284240B12AB984B3F25CC098D3DACFA328424052B36660B3F25CC04FC6DAD7A7284240	5562
123	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010500000000000000	5563
\.


--
-- Data for Name: dist_line_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_line_sub (gid, agency, region, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, width, type, plant_dama, accessibil, visibility, comments, primary_ob, secondary_, miles_dist, km_dist, treated, dist_sever, cultural, t_e_specie, gps_photo, soil_vulne, photo_azim, qa_qc, old_dist_c, shape_stle, shape_leng, geom, audit_id) FROM stdin;
5	1	Hidden Valley N	Pinon-Juniper	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E6100000010000000102000000020000000100000084045DC0E86020FB706D42400100000004945CC0E6A1994438D34140	5577
324	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E6100000010000000102000000020000000100000062AE5CC0F19057FF235F424001000000E0E45CC07A487E7615634240	5578
1243	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E61000000100000001020000000400000001000000B4D45CC0897C750CA46B4240010000008AD15CC071BB29FB650642400100000020695CC033273AFE681B42400100000080BD5CC0CB1A4206564E4240	5579
\.


--
-- Data for Name: dist_point; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_point (gid, agency, region, ecosystem, gps_date, dist_code, use_freq, use_recent, dist_pt_ty, accessibil, visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated, cultural, t_e_specie, gps_photo, soil_vulne, dist_use, photo_azim, qa_qc, old_distco, geom, audit_id) FROM stdin;
7	3	Ivanpah N	Bristlecone/ Limber Pine	\N	\N	\N	\N	\N	\N	\N	\N	\N	jhbjhbjhb	\N	\N	\N	\N	\N	21	21	\N	\N	\N	\N	\N	010100000000000000B8EE5CC009746E6576664240	5568
6969	2	California Wash	Pinon-Juniper	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	21	\N	\N	\N	\N	\N	01010000002300000086B75CC0FE74EF3F5CC24240	5569
2134	2	Black Mt Area	\N	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Yes	21	21	\N	\N	\N	\N	\N	010100000000000000D0D65CC0FF785141BD2A4340	5570
\.


--
-- Data for Name: dist_point_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_point_sub (gid, agency, region, ecosystem, gps_date, dist_code, use_freq, use_recent, dist_pt_ty, accessibil, visibility, comments, primary_ob, secondary_, previously, project_na, estimate_s, treated, cultural, t_e_specie, gps_photo, soil_vulne, dist_use, photo_azim, qa_qc, old_distco, geom, audit_id) FROM stdin;
4	3	Indian Springs Valley N	Open Water	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	0101000020E6100000010000003CC55CC0D55C5A8D9F314240	5564
7	3	Ivanpah N	Bristlecone/ Limber Pine	\N	\N	\N	\N	\N	\N	\N	\N	\N	jhbjhbjhb	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	0101000020E610000000000000B8EE5CC00A746E6576664240	5565
55	2	Jean Lake Valley	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	0101000020E610000000000000B8EE5CC00A746E6576664240	5566
54	3	Amargosa Desert E	\N	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	\N	\N	\N	0101000020E610000000000000CEF65CC0A6832A67588D4240	5567
1	2	\N	\N	2018-02-09	FWS-20180209-24049	\N	\N	\N	\N	\N	\N	me	\N	\N	\N	\N	\N	Yes	No	\N	\N	\N	\N	\N	\N	0101000020E61000000100000092AB5CC09F4977CF36764240	5603
2	1	\N	\N	2018-02-12	FS-20180212-161606	\N	\N	\N	\N	\N	\N	cvx	\N	\N	\N	\N	\N	No	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000010000004EE05CC09F4977CF36764240	5606
\.


--
-- Data for Name: dist_poly_centroid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_poly_centroid (gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, orig_fid, geom, audit_id) FROM stdin;
2	1	Government Wash	\N	1998-12-02	GW0911298C	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Road = 091; Type = DESERT PAVEMENT; Old Code = CB9809A - LE Case#:  - Wilderness:*None* - TreatComp:Yes - TreatType:  - TreatDate: - LengthSQFT:0	\N	\N	0.217412740000	0.00000000000	Yes	0	\N	\N	\N	\N	0	Yes	\N	2	01010000009D6519D35EB25CC0312C7D0CFE114240	5571
\.


--
-- Data for Name: dist_polygon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_polygon (gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, shape_leng, shape_area, geom, audit_id) FROM stdin;
2	2	Hidden Valley S	Wetland	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010600000001000000010300000001000000060000000000000040B25CC09D65FD85461A4240000000000C9B5CC0553283166A2C42400000000054AD5CC05F9BCDF0AD2E42400000000090CB5CC0487E35BD9D2542400000000090CB5CC0C990D250BC1542400000000040B25CC09D65FD85461A4240	5575
1424	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010600000001000000010300000001000000050000002300000066C85CC0CCA14A34B470424023000000D6A35CC07E47E0078C2D4240230000005A7A5CC0EB6CC9C3B048424023000000FAAC5CC0E60C31CF30A342402300000066C85CC0CCA14A34B4704240	5576
1	1	Black Mt Area	\N	2018-02-12	FS-20180212-161658	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dasd	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000000010000000103000000010000001300000023000000EE5E5CC0481585B93BC04140EDFFB7FF25515CC06DAB8EA0C2CA4140FDFF6FFF75585CC05B4A574485E2414013004800AE655CC09551FD65DEDE41400C0028FF6D6C5CC0784F4D7A5CCC41402300000036715CC096F611711CBC414013004800E6695CC036DF1AB091B1414013004800AE655CC036DF1AB091B14140FDFF6FFFAD5C5CC05150DFDBF1B24140EDFFB7FF5D555CC0994B5C3C67B341400C0028FF45495CC026FCBA050CA14140FDFF6FFF75585CC089154122848A4140FDFF6FFFFD485CC0FDA080224B874140230000009E455CC0B2CE2D4B0E8A414023000000FE3F5CC05385CCA9C69841400C0028FF9D3C5CC0F54CAD25B0AA41400C0028FFA5435CC07EAE406987B741401C00E0FE65535CC05E4930F181BA414023000000EE5E5CC0481585B93BC04140	5608
\.


--
-- Data for Name: dist_polygon_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dist_polygon_sub (gid, agency, regions, ecosystem, gps_date, dist_code, dist_use, use_freq, use_recent, site_stabi, dist_crust, undist_cru, depth, dist_poly_, plant_dama, assessibil, visibility, comments, primary_ob, secondary_, acres_rest, kmsq_resto, treated, dist_sever, cultural, t_e_specie, gps_photo, site_vulne, photo_azim, qa_qc, old_distco, shape_star, shape_stle, shape_leng, shape_area, geom, audit_id) FROM stdin;
2	2	Hidden Valley S	Wetland	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E610000001000000010300000001000000060000000100000040B25CC0A165FD85461A4240010000000C9B5CC0503283166A2C42400100000054AD5CC0649BCDF0AD2E42400100000090CB5CC0487E35BD9D2542400100000090CB5CC0CB90D250BC1542400100000040B25CC0A165FD85461A4240	5572
1424	0	Indian Springs Valley N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E610000001000000010300000001000000050000000100000066C85CC0CDA14A34B470424001000000D6A35CC07E47E0078C2D4240010000005A7A5CC0EB6CC9C3B048424001000000FAAC5CC0E80C31CF30A342400100000066C85CC0CDA14A34B4704240	5573
24	0	Amargosa Desert W	\N	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E61000000100000001030000000100000005000000010094FF112E5DC05DD2ABD64BB44240000028FF713A5DC0C6905008929A4240020028FFB1455DC00664F467F7B442400100B8FFE1395DC02CFA308742C54240010094FF112E5DC05DD2ABD64BB44240	5574
\.


--
-- Data for Name: fs_regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fs_regions (gid, objectid, region, area_acres, code, shape_leng, shape_le_1, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: mdep_boundary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY mdep_boundary (gid, sde_sde_bo, perimeter, bndpmoj_, bndpmoj_id, inside, shape_leng, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: mdi_boundary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY mdi_boundary (gid, id, shape_leng, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: monitoring_1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY monitoring_1 (gid, agency, primary_ob, secondary_, gps_date, gps_photo, photo_azim, reuse_disc, resto_inte, reveg_succ, comments, qa_qc, geom, audit_id) FROM stdin;
\.


--
-- Data for Name: nv_counties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY nv_counties (gid, objectid, restoratio, perimeter, nv_county_, nv_count_1, name, state_name, state_fips, cnty_fips, fips, pop1990, pop1999, pop90_sqmi, households, males, females, white, black, ameri_es, asian_pi, other, hispanic, age_under5, age_5_17, age_18_29, age_30_49, age_50_64, age_65_up, nevermarry, married, separated, widowed, divorced, hsehld_1_m, hsehld_1_f, marhh_chd, marhh_no_c, mhh_child, fhh_child, hse_units, vacant, owner_occ, renter_occ, median_val, medianrent, units_1det, units_1att, units2, units3_9, units10_49, units50_up, mobilehome, no_farms87, avg_size87, crop_acr87, avg_sale87, shape_leng, shape_le_1, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: rest_poly_centroid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY rest_poly_centroid (gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, mulch, monitoring, previously, orig_fid, geom, audit_id) FROM stdin;
10	0	\N	Riparian	\N	Invasive Removal	\N	\N	\N	\N	\N	\N	\N	0.00000000000	0.00000000000	\N	\N	0	\N	\N	\N	\N	\N	\N	10	010100000075AE4E0CF5AB5CC0615E5B8B39594240	5580
\.


--
-- Data for Name: resto_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_line (gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act, nonlists_a, comments, primary_ob, secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in, miles_rest, km_resto, gps_photo, photo_azim, monitoring, previously, qa_qc, shape_leng, geom, audit_id) FROM stdin;
79876	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	qaqc	777	010500000000000000	5582
1	0	Hidden Valley S	Riparian	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010500000001000000010200000004000000000000009CEC5CC04AF77AAE991442400000000014A25CC033273AFE681B424000000000CCBC5CC004DD5593ECED41400000000090CB5CC0C9E4CC0674FA4140	5595
2	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000000010000000102000000020000002300000062AE5CC0F39057FF235F424000000000E0E45CC073487E7615634240	5581
\.


--
-- Data for Name: resto_line_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_line_sub (gid, agency, region, ecosystem, gps_date, resto_code, resto_act, te_act, nonlists_a, comments, primary_ob, secondary_, project_na, treatment_, signed, mulch, deep_till, barrier_in, miles_rest, km_resto, gps_photo, photo_azim, monitoring, previously, qa_qc, shape_stle, shape_leng, geom, audit_id) FROM stdin;
435	\N	California Wash	Bristlecone/ Limber Pine	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E6100000010000000102000000020000000100000060745CC011DB1A083F834240010000002C5D5CC08DD0834C32634240	5585
1	1	California Wash	Mixed Conifer	2018-02-16	NPS-20180216-185016	\N	\N	\N	\N	me	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E61000000100000001020000000400000001800400A3BB5CC08E80E7FF902A41400100F7FFCCB55CC0F0C4AD5B5F2741400200090007B55CC0ECD7BA3C812141400100F7FFF9B55CC0EC25DD5A66164140	5611
2	1	Amargosa Desert W	Mixed Conifer	2018-02-28	NPS-20180228-222113	Road Decommissioning	\N	\N	\N	efd	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0105000020E6100000010000000102000000020000000100000008085DC0499EDB20158942400100B8FFE7065DC059902B224F634240	5612
\.


--
-- Data for Name: resto_point; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_point (gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments, primary_ob, secondary_, project_na, sqft_resto, gps_photo, photo_azim, previously, qa_qc, geom, audit_id) FROM stdin;
15	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010100000023000000369E5CC052905228D7A04240	5537
98401	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010100000023000000EACB5CC04BEA7BE59B514240	5539
1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010100000023000000AAC05CC0721E53612E5A4240	5594
2	2	Indian Springs Valley N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000000230000005A7A5CC0CECF3C75FA534240	5597
3	1	Hidden Valley S	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010100000000000000A8865CC0FE90B61C482B4240	5538
\.


--
-- Data for Name: resto_point_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_point_sub (gid, agency, region, ecosystem, gps_date, resto_code, resto_acti, comments, primary_ob, secondary_, project_na, sqft_resto, gps_photo, photo_azim, previously, qa_qc, geom, audit_id) FROM stdin;
23	1	Garnet Valley	Mojave Desert Scrub	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000010000009AB25CC0C7085AAEDB884240	5545
54	1	Greasewood Basin	Mojave Desert Scrub	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E610000001000000FA7F5CC07E3A2F23A4954240	5546
420	1	Greasewood Basin	Open Water	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E610000001000000C8755CC01FA97C54EA8E4240	5547
432	3	Amargosa Desert E	Alpine	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E61000000100000086B75CC056D604D9F3694240	5550
32	1	Black Mt Area	Mixed Conifer	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000010000005C0E5DC057686AE4C37F4240	5551
65	1	Amargosa Desert W	Mixed Conifer	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E61000000100000080EA5CC08E985426C8BC4240	5552
1	2	Amargosa Desert W	Bristlecone/ Limber Pine	2018-02-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E61000000100000052735CC0A00675B09F874240	5592
2	1	Black Mt Area	Bristlecone/ Limber Pine	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000010000007C765CC0E7B4749D32A44240	5548
3	\N	\N	\N	2018-02-09	\N	\N	hjkhkfjhdskhfksjhflksdjhfklshjdfkldsjhfkl	\N	\N	\N	\N	\N	\N	Unknown	\N	0101000020E6100000010000006AB55CC0B1803195943B4240	5602
4	1	\N	\N	2018-02-12	FS-20180212-161523	\N	\N	nds	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000010000003CC55CC011E5434A22834240	5605
5	1	Amargosa Desert E	\N	2018-02-13	NPS-20180213-163802	Graffiti Removal	\N	me	\N	\N	\N	\N	\N	\N	\N	0101000020E6100000018004C02FBA5CC07D36C15F41204140	5549
6	3	Black Mt Area	Blackbrush/ Shadscale	2018-04-03	FWS-20180403-13407	\N	\N	me	\N	\N	\N	\N	\N	\N	\N	0101000020E610000001007070B61E5DC0B6097D24C9954240	5613
\.


--
-- Data for Name: resto_polygon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_polygon (gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, mulch, monitoring, previously, shape_leng, shape_area, geom, audit_id) FROM stdin;
6256	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010600000001000000010300000001000000050000000000000008AE5CC0EFDA883E03784240000000000C9B5CC001EF79BCC0AC41400000000024DD5CC09227B42081EA41400000000080EA5CC064863A08D33C42400000000008AE5CC0EFDA883E03784240	5541
1	2	Amargosa Desert W	Bristlecone/ Limber Pine	\N	\N	No	No	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	010600000001000000010300000001000000080000000000000018E95CC0EAB4749D32A4424000000000E0B75CC05B10607D03BF4240000000000CC85CC024DF31FDC2964240000000008CDE5CC0676FF0DCD69242400000000048B95CC0F03D5B1C9A2A42400000000028CA5CC08DED7A3366E64140000000006CEF5CC0C3BA421E566542400000000018E95CC0EAB4749D32A44240	5540
\.


--
-- Data for Name: resto_polygon_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resto_polygon_sub (gid, agency, region, ecosystem, resto_code, resto_acti, te_action, non_list_a, comments, primary_ob, secondary_, project_na, treatment_, acres_rest, kmsq_resto, gps_date, gps_photo, photo_azim, signed, deep_till, barrier_in, mulch, monitoring, previously, shape_star, shape_stle, shape_leng, shape_area, geom, audit_id) FROM stdin;
452	2	Greasewood Basin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E6100000010000000103000000010000000400000001000000E8BE5CC0FC232B5E737742400100000040B25CC0649BCDF0AD2E42400100000060CE5CC01F5FC6A1A63F424001000000E8BE5CC0FC232B5E73774240	5554
43	1	Amargosa Desert W	Mixed Conifer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-01-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E6100000010000000103000000010000000500000001CAFFF1AAD65CC075D218F60A8F42400100004AC2D65CC027D4E2C2258F424001000056B6D65CC05AE8C7C4328F424001EEFFFDA7D65CC027D4E2C2258F424001CAFFF1AAD65CC075D218F60A8F4240	5555
54	\N	Black Mt Area	Mixed Conifer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-01-28	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E6100000010000000103000000010000000300000001000000E6B15CC0043FEB69CF9C424001002400AAC95CC02FAA9030DE89424001000000E6B15CC0043FEB69CF9C4240	5586
96	2	Black Mt Area	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-02-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E610000001000000010300000001000000040000000100F7BF57A75CC0A40C3DE87CAC42400200E5BF1AAB5CC0C8CB76B620A442400180F2BF1AB45CC0AC8C6AAA2BAF42400100F7BF57A75CC0A40C3DE87CAC4240	5587
1	1	Amargosa Desert E	Bristlecone/ Limber Pine	NPS-20180216-133435	\N	\N	\N	\N	me	\N	\N	\N	\N	\N	2018-02-16	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0106000020E610000001000000010300000001000000060000000100F73F5FB65CC07664B2D858374140018004806ABF5CC0BD398E31D72941400100F7FFCCB55CC0AF9A3EBA712041400180F2FFE9C25CC02A1B6E6D8C28414001000000B8C15CC0940E1549BB2E41400100F73F5FB65CC07664B2D858374140	5553
\.


--
-- Data for Name: roads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY roads (gid, route_type, dominantsu, route_widt, name, comment, sourcethm, status, rd_number, rs2477_id, rd_status, indicator_, length_mi, no, gtlf_id, admin_st, gtlf_plan_, famslink, gtlf_own, gtlf_nu, gtlf_nm, gtlf_nu2, gtlf_nm2, gtlf_surfa, gtlf_carto, noshow_rsn, use_restri, fun_class, spec_dsgtn, esmtrow, use_class, coord_src_, coord_src2, date_, miles, condition, use_level, created_us, created_da, last_edite, last_edi_1, objectid_1, road_statu, shape_leng, geom) FROM stdin;
\.


--
-- Data for Name: snap_extent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY snap_extent (gid, id, shape_leng, shape_area, geom) FROM stdin;
\.


--
-- Data for Name: soil_vulnerability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY soil_vulnerability (gid, objectid, fid_nevada, fid_neva_1, restoratio, perimeter, fmatn, l_name, geologicfm, statemap, county, bioagemax, bioagemin, modpoly, notes, refs, reviewed, shape_leng, vulfmatn, vulgeologi, fid_nvcoun, fid_nvco_1, area_1, perimete_1, county_nam, area__sq_m, comment, acres, fid_swland, area_12, perimete_2, ca_landow_, ca_landow1, region, owner, source, macode, status, matype, owner_name, new_owner, name, state, fid_surfac, fid_surf_1, areasymbol, spatialver, musym, mukey, mukey_1, surftext, stmergevul, fid_nvco_2, fid_nvco_3, area_12_13, perimete_3, county_n_1, area__sq_1, comment_1, acres_1, fid_swla_1, area_12_14, perimete_4, ca_lando_1, ca_lando_2, region_1, owner_1, source_1, macode_1, status_1, matype_1, owner_na_1, new_owne_1, name_1, state_1, shape_le_1, shape_le_2, shape_area, geom, audit_id) FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text, audit_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (user_name, first_name, last_name, password, certificate, agency, password_reset) FROM stdin;
admin	first	last	password	\N	1	0
admin2	sdfsdf	sdfsdf	AOSO5K3X	\N	0	\N
admin3	safs	safsd	ZJXjuHuO	\N	2	\N
admin4	sdfs	sdg	E3T4OEZd	\N	1	\N
\.


SET search_path = pgmemento, pg_catalog;

--
-- Name: audit_column_log_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('audit_column_log_id_seq', 535, true);


--
-- Name: audit_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('audit_id_seq', 5613, true);


--
-- Name: audit_table_log_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('audit_table_log_id_seq', 19, true);


--
-- Name: row_log_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('row_log_id_seq', 5629, true);


--
-- Name: table_event_log_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('table_event_log_id_seq', 97, true);


--
-- Name: transaction_log_id_seq; Type: SEQUENCE SET; Schema: pgmemento; Owner: ubuntu
--

SELECT pg_catalog.setval('transaction_log_id_seq', 97, true);


SET search_path = public, pg_catalog;

--
-- Name: barrier_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('barrier_gid_seq', 3, true);


--
-- Name: barrier_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('barrier_sub_gid_seq', 4, true);


--
-- Name: blm_regions_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('blm_regions_gid_seq', 1, false);


--
-- Name: dist_line_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_line_gid_seq', 1, false);


--
-- Name: dist_line_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_line_sub_gid_seq', 1, false);


--
-- Name: dist_point_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_point_gid_seq', 1, false);


--
-- Name: dist_point_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_point_sub_gid_seq', 2, true);


--
-- Name: dist_poly_centroid_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_poly_centroid_gid_seq', 1, false);


--
-- Name: dist_polygon_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_polygon_gid_seq', 1, true);


--
-- Name: dist_polygon_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dist_polygon_sub_gid_seq', 1, true);


--
-- Name: fs_regions_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fs_regions_gid_seq', 1, false);


--
-- Name: mdep_boundary_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('mdep_boundary_gid_seq', 1, false);


--
-- Name: mdi_boundary_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('mdi_boundary_gid_seq', 1, false);


--
-- Name: measures_measure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ubuntu
--

SELECT pg_catalog.setval('measures_measure_id_seq', 1, false);


--
-- Name: monitoring_1_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('monitoring_1_gid_seq', 1, false);


--
-- Name: nv_counties_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('nv_counties_gid_seq', 1, false);


--
-- Name: rest_poly_centroid_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('rest_poly_centroid_gid_seq', 1, false);


--
-- Name: resto_line_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_line_gid_seq', 2, true);


--
-- Name: resto_line_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_line_sub_gid_seq', 2, true);


--
-- Name: resto_point_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_point_gid_seq', 3, true);


--
-- Name: resto_point_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_point_sub_gid_seq', 6, true);


--
-- Name: resto_polygon_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_polygon_gid_seq', 1, false);


--
-- Name: resto_polygon_sub_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resto_polygon_sub_gid_seq', 1, true);


--
-- Name: roads_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('roads_gid_seq', 1, false);


--
-- Name: snap_extent_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('snap_extent_gid_seq', 1, false);


--
-- Name: soil_vulnerability_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('soil_vulnerability_gid_seq', 1, false);


SET search_path = pgmemento, pg_catalog;

--
-- Name: audit_column_log audit_column_log_pk; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY audit_column_log
    ADD CONSTRAINT audit_column_log_pk PRIMARY KEY (id);


--
-- Name: audit_table_log audit_table_log_pk; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY audit_table_log
    ADD CONSTRAINT audit_table_log_pk PRIMARY KEY (id);


--
-- Name: row_log row_log_pk; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY row_log
    ADD CONSTRAINT row_log_pk PRIMARY KEY (id);


--
-- Name: table_event_log table_event_log_pk; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY table_event_log
    ADD CONSTRAINT table_event_log_pk PRIMARY KEY (id);


--
-- Name: transaction_log transaction_log_pk; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY transaction_log
    ADD CONSTRAINT transaction_log_pk PRIMARY KEY (id);


--
-- Name: transaction_log transaction_log_unique_txid; Type: CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY transaction_log
    ADD CONSTRAINT transaction_log_unique_txid UNIQUE (txid);


SET search_path = public, pg_catalog;

--
-- Name: barrier barrier_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier
    ADD CONSTRAINT barrier_audit_id_key UNIQUE (audit_id);


--
-- Name: barrier barrier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier
    ADD CONSTRAINT barrier_pkey PRIMARY KEY (gid);


--
-- Name: barrier_sub barrier_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier_sub
    ADD CONSTRAINT barrier_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: barrier_sub barrier_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY barrier_sub
    ADD CONSTRAINT barrier_sub_pkey PRIMARY KEY (gid);


--
-- Name: blm_regions blm_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY blm_regions
    ADD CONSTRAINT blm_regions_pkey PRIMARY KEY (gid);


--
-- Name: dist_line dist_line_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line
    ADD CONSTRAINT dist_line_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_line dist_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line
    ADD CONSTRAINT dist_line_pkey PRIMARY KEY (gid);


--
-- Name: dist_line_sub dist_line_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line_sub
    ADD CONSTRAINT dist_line_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_line_sub dist_line_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_line_sub
    ADD CONSTRAINT dist_line_sub_pkey PRIMARY KEY (gid);


--
-- Name: dist_point dist_point_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point
    ADD CONSTRAINT dist_point_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_point dist_point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point
    ADD CONSTRAINT dist_point_pkey PRIMARY KEY (gid);


--
-- Name: dist_point_sub dist_point_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point_sub
    ADD CONSTRAINT dist_point_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_point_sub dist_point_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_point_sub
    ADD CONSTRAINT dist_point_sub_pkey PRIMARY KEY (gid);


--
-- Name: dist_poly_centroid dist_poly_centroid_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_poly_centroid
    ADD CONSTRAINT dist_poly_centroid_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_poly_centroid dist_poly_centroid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_poly_centroid
    ADD CONSTRAINT dist_poly_centroid_pkey PRIMARY KEY (gid);


--
-- Name: dist_polygon dist_polygon_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon
    ADD CONSTRAINT dist_polygon_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_polygon dist_polygon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon
    ADD CONSTRAINT dist_polygon_pkey PRIMARY KEY (gid);


--
-- Name: dist_polygon_sub dist_polygon_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon_sub
    ADD CONSTRAINT dist_polygon_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: dist_polygon_sub dist_polygon_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dist_polygon_sub
    ADD CONSTRAINT dist_polygon_sub_pkey PRIMARY KEY (gid);


--
-- Name: fs_regions fs_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fs_regions
    ADD CONSTRAINT fs_regions_pkey PRIMARY KEY (gid);


--
-- Name: mdep_boundary mdep_boundary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY mdep_boundary
    ADD CONSTRAINT mdep_boundary_pkey PRIMARY KEY (gid);


--
-- Name: mdi_boundary mdi_boundary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY mdi_boundary
    ADD CONSTRAINT mdi_boundary_pkey PRIMARY KEY (gid);


--
-- Name: monitoring_1 monitoring_1_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY monitoring_1
    ADD CONSTRAINT monitoring_1_audit_id_key UNIQUE (audit_id);


--
-- Name: monitoring_1 monitoring_1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY monitoring_1
    ADD CONSTRAINT monitoring_1_pkey PRIMARY KEY (gid);


--
-- Name: nv_counties nv_counties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY nv_counties
    ADD CONSTRAINT nv_counties_pkey PRIMARY KEY (gid);


--
-- Name: rest_poly_centroid rest_poly_centroid_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY rest_poly_centroid
    ADD CONSTRAINT rest_poly_centroid_audit_id_key UNIQUE (audit_id);


--
-- Name: rest_poly_centroid rest_poly_centroid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY rest_poly_centroid
    ADD CONSTRAINT rest_poly_centroid_pkey PRIMARY KEY (gid);


--
-- Name: resto_line resto_line_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line
    ADD CONSTRAINT resto_line_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_line resto_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line
    ADD CONSTRAINT resto_line_pkey PRIMARY KEY (gid);


--
-- Name: resto_line_sub resto_line_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line_sub
    ADD CONSTRAINT resto_line_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_line_sub resto_line_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_line_sub
    ADD CONSTRAINT resto_line_sub_pkey PRIMARY KEY (gid);


--
-- Name: resto_point resto_point_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point
    ADD CONSTRAINT resto_point_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_point resto_point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point
    ADD CONSTRAINT resto_point_pkey PRIMARY KEY (gid);


--
-- Name: resto_point_sub resto_point_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point_sub
    ADD CONSTRAINT resto_point_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_point_sub resto_point_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_point_sub
    ADD CONSTRAINT resto_point_sub_pkey PRIMARY KEY (gid);


--
-- Name: resto_polygon resto_polygon_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon
    ADD CONSTRAINT resto_polygon_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_polygon resto_polygon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon
    ADD CONSTRAINT resto_polygon_pkey PRIMARY KEY (gid);


--
-- Name: resto_polygon_sub resto_polygon_sub_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon_sub
    ADD CONSTRAINT resto_polygon_sub_audit_id_key UNIQUE (audit_id);


--
-- Name: resto_polygon_sub resto_polygon_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resto_polygon_sub
    ADD CONSTRAINT resto_polygon_sub_pkey PRIMARY KEY (gid);


--
-- Name: roads roads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY roads
    ADD CONSTRAINT roads_pkey PRIMARY KEY (gid);


--
-- Name: snap_extent snap_extent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY snap_extent
    ADD CONSTRAINT snap_extent_pkey PRIMARY KEY (gid);


--
-- Name: soil_vulnerability soil_vulnerability_audit_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY soil_vulnerability
    ADD CONSTRAINT soil_vulnerability_audit_id_key UNIQUE (audit_id);


--
-- Name: soil_vulnerability soil_vulnerability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY soil_vulnerability
    ADD CONSTRAINT soil_vulnerability_pkey PRIMARY KEY (gid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_name);


SET search_path = pgmemento, pg_catalog;

--
-- Name: column_log_column_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX column_log_column_idx ON audit_column_log USING btree (column_name);


--
-- Name: column_log_range_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX column_log_range_idx ON audit_column_log USING gist (txid_range);


--
-- Name: column_log_table_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX column_log_table_idx ON audit_column_log USING btree (audit_table_id);


--
-- Name: row_log_audit_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX row_log_audit_idx ON row_log USING btree (audit_id);


--
-- Name: row_log_changes_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX row_log_changes_idx ON row_log USING gin (changes);


--
-- Name: row_log_event_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX row_log_event_idx ON row_log USING btree (event_id);


--
-- Name: table_event_log_unique_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE UNIQUE INDEX table_event_log_unique_idx ON table_event_log USING btree (transaction_id, table_relid, op_id);


--
-- Name: table_log_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX table_log_idx ON audit_table_log USING btree (table_name, schema_name);


--
-- Name: table_log_range_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX table_log_range_idx ON audit_table_log USING gist (txid_range);


--
-- Name: transaction_log_date_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX transaction_log_date_idx ON transaction_log USING btree (stmt_date);


--
-- Name: transaction_log_txid_idx; Type: INDEX; Schema: pgmemento; Owner: ubuntu
--

CREATE INDEX transaction_log_txid_idx ON transaction_log USING btree (txid);


SET search_path = public, pg_catalog;

--
-- Name: barrier_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX barrier_geom_idx ON barrier USING gist (geom);


--
-- Name: blm_regions_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blm_regions_geom_idx ON blm_regions USING gist (geom);


--
-- Name: dist_line_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dist_line_geom_idx ON dist_line USING gist (geom);


--
-- Name: dist_point_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dist_point_geom_idx ON dist_point USING gist (geom);


--
-- Name: dist_poly_centroid_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dist_poly_centroid_geom_idx ON dist_poly_centroid USING gist (geom);


--
-- Name: dist_polygon_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dist_polygon_geom_idx ON dist_polygon USING gist (geom);


--
-- Name: fs_regions_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fs_regions_geom_idx ON fs_regions USING gist (geom);


--
-- Name: mdep_boundary_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdep_boundary_geom_idx ON mdep_boundary USING gist (geom);


--
-- Name: mdi_boundary_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdi_boundary_geom_idx ON mdi_boundary USING gist (geom);


--
-- Name: monitoring_1_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitoring_1_geom_idx ON monitoring_1 USING gist (geom);


--
-- Name: nv_counties_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX nv_counties_geom_idx ON nv_counties USING gist (geom);


--
-- Name: rest_poly_centroid_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rest_poly_centroid_geom_idx ON rest_poly_centroid USING gist (geom);


--
-- Name: resto_line_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resto_line_geom_idx ON resto_line USING gist (geom);


--
-- Name: resto_point_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resto_point_geom_idx ON resto_point USING gist (geom);


--
-- Name: resto_polygon_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resto_polygon_geom_idx ON resto_polygon USING gist (geom);


--
-- Name: roads_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roads_geom_idx ON roads USING gist (geom);


--
-- Name: snap_extent_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX snap_extent_geom_idx ON snap_extent USING gist (geom);


--
-- Name: soil_vulnerability_geom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX soil_vulnerability_geom_idx ON soil_vulnerability USING gist (geom);


--
-- Name: resto_point log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_polygon log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_point_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_polygon_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: barrier log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON barrier FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: barrier_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON barrier_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_line log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_point_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_point log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_poly_centroid log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_polygon_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_polygon log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: dist_line_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON dist_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: monitoring_1 log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON monitoring_1 FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: rest_poly_centroid log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON rest_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_line log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_line_sub log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON resto_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: soil_vulnerability log_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_delete_trigger AFTER DELETE ON soil_vulnerability FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_delete();


--
-- Name: resto_point log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_polygon log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_point_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_polygon_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: barrier log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON barrier FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: barrier_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON barrier_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_line log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_point_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_point log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_poly_centroid log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_polygon_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_polygon log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: dist_line_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON dist_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: monitoring_1 log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON monitoring_1 FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: rest_poly_centroid log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON rest_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_line log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_line_sub log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON resto_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: soil_vulnerability log_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_insert_trigger AFTER INSERT ON soil_vulnerability FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_insert();


--
-- Name: resto_point log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_point FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_polygon log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_polygon FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_point_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_point_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_polygon_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_polygon_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: barrier log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON barrier FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: barrier_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON barrier_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_line log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_line FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_point_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_point_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_point log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_point FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_poly_centroid log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_poly_centroid FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_polygon_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_polygon_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_polygon log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_polygon FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: dist_line_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON dist_line_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: monitoring_1 log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON monitoring_1 FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: rest_poly_centroid log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON rest_poly_centroid FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_line log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_line FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_line_sub log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON resto_line_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: soil_vulnerability log_transaction_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_transaction_trigger BEFORE INSERT OR DELETE OR UPDATE OR TRUNCATE ON soil_vulnerability FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_transaction();


--
-- Name: resto_point log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_point FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_polygon log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_polygon FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_point_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_point_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_polygon_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_polygon_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: barrier log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON barrier FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: barrier_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON barrier_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_line log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_line FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_point_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_point_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_point log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_point FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_poly_centroid log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_poly_centroid FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_polygon_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_polygon_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_polygon log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_polygon FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: dist_line_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON dist_line_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: monitoring_1 log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON monitoring_1 FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: rest_poly_centroid log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON rest_poly_centroid FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_line log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_line FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_line_sub log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON resto_line_sub FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: soil_vulnerability log_truncate_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_truncate_trigger BEFORE TRUNCATE ON soil_vulnerability FOR EACH STATEMENT EXECUTE PROCEDURE pgmemento.log_truncate();


--
-- Name: resto_point log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: resto_polygon log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: resto_point_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: resto_polygon_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: barrier log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON barrier FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: barrier_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON barrier_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_line log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_point_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_point_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_point log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_point FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_poly_centroid log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_polygon_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_polygon_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_polygon log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_polygon FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: dist_line_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON dist_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: monitoring_1 log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON monitoring_1 FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: rest_poly_centroid log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON rest_poly_centroid FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: resto_line log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_line FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: resto_line_sub log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON resto_line_sub FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


--
-- Name: soil_vulnerability log_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_update_trigger AFTER UPDATE ON soil_vulnerability FOR EACH ROW EXECUTE PROCEDURE pgmemento.log_update();


SET search_path = pgmemento, pg_catalog;

--
-- Name: audit_column_log audit_column_log_fk; Type: FK CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY audit_column_log
    ADD CONSTRAINT audit_column_log_fk FOREIGN KEY (audit_table_id) REFERENCES audit_table_log(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: row_log row_log_table_fk; Type: FK CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY row_log
    ADD CONSTRAINT row_log_table_fk FOREIGN KEY (event_id) REFERENCES table_event_log(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: table_event_log table_event_log_txid_fk; Type: FK CONSTRAINT; Schema: pgmemento; Owner: ubuntu
--

ALTER TABLE ONLY table_event_log
    ADD CONSTRAINT table_event_log_txid_fk FOREIGN KEY (transaction_id) REFERENCES transaction_log(txid) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schema_drop_pre_trigger; Type: EVENT TRIGGER; Schema: -; Owner: ubuntu
--

CREATE EVENT TRIGGER schema_drop_pre_trigger ON ddl_command_start
         WHEN TAG IN ('DROP SCHEMA')
   EXECUTE PROCEDURE pgmemento.schema_drop_pre_trigger();


ALTER EVENT TRIGGER schema_drop_pre_trigger OWNER TO ubuntu;

--
-- Name: table_alter_post_trigger; Type: EVENT TRIGGER; Schema: -; Owner: ubuntu
--

CREATE EVENT TRIGGER table_alter_post_trigger ON ddl_command_end
         WHEN TAG IN ('ALTER TABLE')
   EXECUTE PROCEDURE pgmemento.table_alter_post_trigger();


ALTER EVENT TRIGGER table_alter_post_trigger OWNER TO ubuntu;

--
-- Name: table_alter_pre_trigger; Type: EVENT TRIGGER; Schema: -; Owner: ubuntu
--

CREATE EVENT TRIGGER table_alter_pre_trigger ON ddl_command_start
         WHEN TAG IN ('ALTER TABLE')
   EXECUTE PROCEDURE pgmemento.table_alter_pre_trigger();


ALTER EVENT TRIGGER table_alter_pre_trigger OWNER TO ubuntu;

--
-- Name: table_drop_post_trigger; Type: EVENT TRIGGER; Schema: -; Owner: ubuntu
--

CREATE EVENT TRIGGER table_drop_post_trigger ON sql_drop
         WHEN TAG IN ('DROP TABLE')
   EXECUTE PROCEDURE pgmemento.table_drop_post_trigger();


ALTER EVENT TRIGGER table_drop_post_trigger OWNER TO ubuntu;

--
-- Name: table_drop_pre_trigger; Type: EVENT TRIGGER; Schema: -; Owner: ubuntu
--

CREATE EVENT TRIGGER table_drop_pre_trigger ON ddl_command_start
         WHEN TAG IN ('DROP TABLE')
   EXECUTE PROCEDURE pgmemento.table_drop_pre_trigger();


ALTER EVENT TRIGGER table_drop_pre_trigger OWNER TO ubuntu;

--
-- PostgreSQL database dump complete
--


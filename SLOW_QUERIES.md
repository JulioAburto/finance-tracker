query 1
select
  e.name,
  n.nspname as schema,
  e.default_version,
  x.extversion as installed_version,
  e.comment,
  ev.schema as default_version_schema
from
  pg_available_extensions e
  left join pg_extension x on e.name = x.extname
  left join pg_namespace n on x.extnamespace = n.oid
  left join pg_available_extension_versions ev on ev.name = e.name
  and ev.version = e.default_version

query 2
select
  name
from
  pg_timezone_names


query 3
with
  page as (
    select
      c.oid,
      c.relname,
      c.relrowsecurity,
      c.relforcerowsecurity,
      c.relreplident,
      nc.nspname as schema,
      -- Computed once here so the final select can reference it for both the
      -- raw byte count and pg_size_pretty without re-walking heap+toast+indexes.
      pg_total_relation_size(c.oid) as bytes_raw
    from
      pg_namespace nc
      join pg_class c on nc.oid = c.relnamespace
    where
      c.relkind in ($1, $2)
      and not pg_is_other_temp_schema(nc.oid)
      and c.oid > $3
      and (
        pg_has_role(c.relowner, $4)
        or has_table_privilege(c.oid, $5)
        or has_any_column_privilege(c.oid, $6)
      )
      and nc.nspname in ($7)
    order by
      c.oid
    limit
      $8
  ),
  page_primary_keys as (
    select
      c.oid::int8 as table_id,
      jsonb_agg(
        jsonb_build_object(
          $9,
          c.oid::int8,
          $10,
          n.nspname,
          $11,
          c.relname,
          $12,
          a.attname
        )
        order by
          array_position(i.indkey, a.attnum)
      ) as primary_keys
    from
      pg_index i
      join pg_class c on i.indrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid
      and a.attnum = any (i.indkey)
    where
      i.indisprimary
      and c.oid in (
        select
          oid
        from
          page
      )
    group by
      c.oid
  ),
  -- Two-armed UNION ALL keyed by table_id so the downstream join is a plain
  -- equi-join (see tables CTE below). The previous shape used an OR across
  -- (source_oid, target_oid), which planners can't decompose into two index
  -- probes. The target-side arm skips self-referential FKs so they aren't
  -- emitted twice.
  page_relationships as (
    select
      csa.oid::int8 as table_id,
      c.oid::int8 as id,
      c.conname as constraint_name,
      nsa.nspname as source_schema,
      csa.relname as source_table_name,
      sa.attname as source_column_name,
      nta.nspname as target_table_schema,
      cta.relname as target_table_name,
      ta.attname as target_column_name
    from
      pg_constraint c
      join pg_class csa on csa.oid = c.conrelid
      join pg_namespace nsa on nsa.oid = csa.relnamespace
      -- Pair conkey/confkey by ordinal so composite FKs don't fan out into a
      -- cross-product of (source_col, target_col) rows.
      join lateral unnest(c.conkey, c.confkey) as fk (src_attnum, tgt_attnum) on $13
      join pg_attribute sa on sa.attrelid = c.conrelid
      and sa.attnum = fk.src_attnum
      join pg_class cta on cta.oid = c.confrelid
      join pg_namespace nta on nta.oid = cta.relnamespace
      join pg_attribute ta on ta.attrelid = c.confrelid
      and ta.attnum = fk.tgt_attnum
    where
      c.contype = $14
      and csa.oid in (
        select
          oid
        from
          page
      )
    union all
    select
      cta.oid::int8 as table_id,
      c.oid::int8 as id,
      c.conname as constraint_name,
      nsa.nspname as source_schema,
      csa.relname as source_table_name,
      sa.attname as source_column_name,
      nta.nspname as target_table_schema,
      cta.relname as target_table_name,
      ta.attname as target_column_name
    from
      pg_constraint c
      join pg_class csa on csa.oid = c.conrelid
      join pg_namespace nsa on nsa.oid = csa.relnamespace
      join lateral unnest(c.conkey, c.confkey) as fk (src_attnum, tgt_attnum) on $15
      join pg_attribute sa on sa.attrelid = c.conrelid
      and sa.attnum = fk.src_attnum
      join pg_class cta on cta.oid = c.confrelid
      join pg_namespace nta on nta.oid = cta.relnamespace
      join pg_attribute ta on ta.attrelid = c.confrelid
      and ta.attnum = fk.tgt_attnum
    where
      c.contype = $16
      and cta.oid in (
        select
          oid
        from
          page
      )
      and cta.oid <> csa.oid
  ),
  tables as (
    select
      p.oid::int8 as id,
      p.schema as schema,
      p.relname as name,
      p.relrowsecurity as rls_enabled,
      p.relforcerowsecurity as rls_forced,
      case
        when p.relreplident = $17 then $18
        when p.relreplident = $19 then $20
        when p.relreplident = $21 then $22
        else $23
      end as replica_identity,
      p.bytes_raw::int8 as bytes,
      pg_size_pretty(p.bytes_raw) as size,
      pg_stat_get_live_tuples (p.oid) as live_rows_estimate,
      pg_stat_get_dead_tuples (p.oid) as dead_rows_estimate,
      obj_description(p.oid) as comment,
      coalesce(pk.primary_keys, $24::jsonb) as primary_keys,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            $25,
            r.id,
            $26,
            r.constraint_name,
            $27,
            r.source_schema,
            $28,
            r.source_table_name,
            $29,
            r.source_column_name,
            $30,
            r.target_table_schema,
            $31,
            r.target_table_name,
            $32,
            r.target_column_name
          )
        ) filter (
          where
            r.id is not null
        ),
        $33::jsonb
      ) as relationships
    from
      page p
      left join page_primary_keys pk on pk.table_id = p.oid
      left join page_relationships r on r.table_id = p.oid
    group by
      p.oid,
      p.schema,
      p.relname,
      p.relrowsecurity,
      p.relforcerowsecurity,
      p.relreplident,
      p.bytes_raw,
      pk.primary_keys
  ),
  columns as (
    -- Adapted from information_schema.columns
    select
      c.oid::int8 as table_id,
      nc.nspname as schema,
      c.relname as table,
      (c.oid || $34 || a.attnum) as id,
      a.attnum as ordinal_position,
      a.attname as name,
      case
        when a.atthasdef then pg_get_expr(ad.adbin, ad.adrelid)
        else $35
      end as default_value,
      case
        when t.typtype = $36 then case
          when bt.typelem <> $37::oid
          and bt.typlen = $38 then $39
          when nbt.nspname = $40 then format_type(t.typbasetype, $41)
          else $42
        end
        else case
          when t.typelem <> $43::oid
          and t.typlen = $44 then $45
          when nt.nspname = $46 then format_type(a.atttypid, $47)
          else $48
        end
      end as data_type,
      COALESCE(bt.typname, t.typname) as format,
      COALESCE(nbt.nspname, nt.nspname) as format_schema,
      a.attidentity in ($49, $50) as is_identity,
      case a.attidentity
        when $51 then $52
        when $53 then $54
        else $55
      end as identity_generation,
      a.attgenerated in ($56) as is_generated,
      not (
        a.attnotnull
        or t.typtype = $57
        and t.typnotnull
      ) as is_nullable,
      (
        c.relkind in ($58, $59)
        or c.relkind in ($60, $61)
        and pg_column_is_updatable (c.oid, a.attnum, $62)
      ) as is_updatable,
      uniques.table_id is not null as is_unique,
      check_constraints.definition as "check",
      array_to_json(
        array(
          select
            enumlabel
          from
            pg_catalog.pg_enum enums
          where
            enums.enumtypid = coalesce(bt.oid, t.oid)
            or enums.enumtypid = coalesce(bt.typelem, t.typelem)
          order by
            enums.enumsortorder
        )
      ) as enums,
      col_description(c.oid, a.attnum) as comment
    from
      pg_attribute a
      left join pg_attrdef ad on a.attrelid = ad.adrelid
      and a.attnum = ad.adnum
      join (
        pg_class c
        join pg_namespace nc on c.relnamespace = nc.oid
      ) on a.attrelid = c.oid
      join (
        pg_type t
        join pg_namespace nt on t.typnamespace = nt.oid
      ) on a.atttypid = t.oid
      left join (
        pg_type bt
        join pg_namespace nbt on bt.typnamespace = nbt.oid
      ) on t.typtype = $63
      and t.typbasetype = bt.oid
      left join (
        select distinct
          on (table_id, ordinal_position) conrelid as table_id,
          conkey[$64] as ordinal_position
        from
          pg_catalog.pg_constraint
        where
          contype = $65
          and cardinality(conkey) = $66
      ) as uniques on uniques.table_id = c.oid
      and uniques.ordinal_position = a.attnum
      left join (
        -- We only select the first column check
        select distinct
          on (table_id, ordinal_position) conrelid as table_id,
          conkey[$67] as ordinal_position,
          substring(
            pg_get_constraintdef(pg_constraint.oid, $68),
            $69,
            length(pg_get_constraintdef(pg_constraint.oid, $70)) - $71
          ) as "definition"
        from
          pg_constraint
        where
          contype = $72
          and cardinality(conkey) = $73
        order by
          table_id,
          ordinal_position,
          oid asc
      ) as check_constraints on check_constraints.table_id = c.oid
      and check_constraints.ordinal_position = a.attnum
    where
      not pg_is_other_temp_schema(nc.oid)
      and a.attnum > $74
      and not a.attisdropped
      and (c.relkind in ($75, $76, $77, $78, $79))
      and (
        pg_has_role(c.relowner, $80)
        or has_column_privilege(c.oid, a.attnum, $81)
      )
      and c.oid in (
        select
          oid
        from
          page
      )
  )
select
  tables.*,
  COALESCE(
    (
      select
        array_agg(row_to_json(columns)) filter (
          where
            columns.table_id = tables.id
        )
      from
        columns
    ),
    $82
  ) as columns
from
  tables
order by
  tables.id
  -- source: dashboard
  -- user: session:a987d388-c173-409d-9075-8dde201735c3
  -- date: 2026-07-29T04:49:21.967Z
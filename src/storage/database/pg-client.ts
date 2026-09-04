import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import 'dotenv/config';

type QueryValue = string | number | boolean | null | undefined | Date | Record<string, unknown> | unknown[];

type QueryResponse<T = any> = {
  data: any | null;
  error: any | null;
  count?: number | null;
};

type SelectOptions = {
  count?: 'exact' | 'planned' | 'estimated';
  head?: boolean;
};

type OrderOptions = {
  ascending?: boolean;
};

type UpsertOptions = {
  onConflict?: string;
  ignoreDuplicates?: boolean;
};

type Filter = {
  column: string;
  operator: '=' | '<>' | '>' | '>=' | '<' | '<=' | 'IS' | 'IS NOT' | 'LIKE' | 'ILIKE' | 'IN' | '@>';
  value: QueryValue;
};

type Order = {
  column: string;
  ascending: boolean;
};

const CONNECTION_ERROR = 'PGDATABASE_URL or DATABASE_URL is not set. Please check your environment variables.';

let pool: Pool | null = null;

function getConnectionString(): string {
  const connectionString = process.env.PGDATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(CONNECTION_ERROR);
  }

  return connectionString;
}

function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
      connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 10000),
      statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS || 60000),
    });
  }

  return pool;
}

async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPostgresPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function query<T extends QueryResultRow = any>(text: string, values?: QueryValue[]): Promise<QueryResult<T>> {
  return getPostgresPool().query<T>(text, values as unknown[] | undefined);
}

function quoteIdentifier(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

function parseColumnList(columns?: string): string {
  if (!columns || columns.trim() === '*' || columns.trim() === '') {
    return '*';
  }

  return columns
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)
    .map((column) => {
      if (column === '*') {
        return '*';
      }

      const match = column.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*))?$/i);
      if (!match) {
        throw new Error(`Unsupported select column expression: ${column}`);
      }

      const [, name, alias] = match;
      return alias ? `${quoteIdentifier(name)} AS ${quoteIdentifier(alias)}` : quoteIdentifier(name);
    })
    .join(', ');
}

function normalizeRows<T>(rows: T[], single: boolean): T | T[] | null {
  if (single) {
    return rows[0] ?? null;
  }

  return rows;
}

class PgQueryBuilder<T extends QueryResultRow = any> implements PromiseLike<QueryResponse<T | T[]>> {
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';

  private selectColumns = '*';

  private returningColumns: string | null = null;

  private values: Record<string, QueryValue> | Record<string, QueryValue>[] | null = null;

  private filters: Filter[] = [];

  private orders: Order[] = [];

  private limitValue: number | null = null;

  private offsetValue: number | null = null;

  private singleResult = false;

  private selectOptions: SelectOptions = {};

  private upsertOptions: UpsertOptions = {};

  constructor(private readonly table: string) {}

  select(columns = '*', options: SelectOptions = {}): this {
    if (this.operation === 'insert' || this.operation === 'update' || this.operation === 'delete' || this.operation === 'upsert') {
      this.returningColumns = parseColumnList(columns);
    } else {
      this.operation = 'select';
      this.selectColumns = parseColumnList(columns);
      this.selectOptions = options;
    }

    return this;
  }

  insert(values: Record<string, QueryValue> | Record<string, QueryValue>[]): this {
    this.operation = 'insert';
    this.values = values;
    return this;
  }

  update(values: Record<string, QueryValue>): this {
    this.operation = 'update';
    this.values = values;
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  upsert(values: Record<string, QueryValue> | Record<string, QueryValue>[], options: UpsertOptions = {}): this {
    this.operation = 'upsert';
    this.values = values;
    this.upsertOptions = options;
    return this;
  }

  eq(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '=', value });
    return this;
  }

  neq(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '<>', value });
    return this;
  }

  gt(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '>', value });
    return this;
  }

  gte(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '>=', value });
    return this;
  }

  lt(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '<', value });
    return this;
  }

  lte(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '<=', value });
    return this;
  }

  is(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: 'IS', value });
    return this;
  }

  not(column: string, operator: string, value: QueryValue): this {
    if (operator === 'is') {
      this.filters.push({ column, operator: 'IS NOT', value });
      return this;
    }

    if (operator === 'eq') {
      return this.neq(column, value);
    }

    throw new Error(`Unsupported not operator: ${operator}`);
  }

  like(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: 'LIKE', value });
    return this;
  }

  ilike(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: 'ILIKE', value });
    return this;
  }

  in(column: string, values: QueryValue[]): this {
    this.filters.push({ column, operator: 'IN', value: values });
    return this;
  }

  contains(column: string, value: QueryValue): this {
    this.filters.push({ column, operator: '@>', value });
    return this;
  }

  order(column: string, options: OrderOptions = {}): this {
    this.orders.push({ column, ascending: options.ascending !== false });
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetValue = from;
    this.limitValue = Math.max(to - from + 1, 0);
    return this;
  }

  single(): this {
    this.singleResult = true;
    this.limitValue = this.limitValue ?? 1;
    return this;
  }

  maybeSingle(): this {
    return this.single();
  }

  then<TResult1 = QueryResponse<T | T[]>, TResult2 = never>(
    onfulfilled?: ((value: QueryResponse<T | T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<QueryResponse<T | T[]>> {
    try {
      if (this.operation === 'select') {
        return await this.executeSelect();
      }

      if (this.operation === 'insert') {
        return await this.executeInsert();
      }

      if (this.operation === 'update') {
        return await this.executeUpdate();
      }

      if (this.operation === 'delete') {
        return await this.executeDelete();
      }

      return await this.executeUpsert();
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        count: null,
      };
    }
  }

  private async executeSelect(): Promise<QueryResponse<T | T[]>> {
    const params: QueryValue[] = [];
    const whereClause = this.buildWhereClause(params);

    if (this.selectOptions.head && this.selectOptions.count) {
      const result = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${quoteIdentifier(this.table)}${whereClause}`,
        params,
      );

      return {
        data: null,
        error: null,
        count: Number(result.rows[0]?.count || 0),
      };
    }

    const orderClause = this.buildOrderClause();
    const paginationClause = this.buildPaginationClause(params);
    const result = await query<T>(
      `SELECT ${this.selectColumns} FROM ${quoteIdentifier(this.table)}${whereClause}${orderClause}${paginationClause}`,
      params,
    );

    return {
      data: normalizeRows(result.rows, this.singleResult) as T | T[] | null,
      error: null,
      count: this.selectOptions.count ? result.rowCount : null,
    };
  }

  private async executeInsert(): Promise<QueryResponse<T | T[]>> {
    const rows = Array.isArray(this.values) ? this.values : [this.values];

    if (!rows.length || !rows[0]) {
      throw new Error('Insert values cannot be empty.');
    }

    const params: QueryValue[] = [];
    const { columns, placeholders } = this.buildValues(rows as Record<string, QueryValue>[], params);
    const returning = this.returningColumns ? ` RETURNING ${this.returningColumns}` : '';
    const result = await query<T>(
      `INSERT INTO ${quoteIdentifier(this.table)} (${columns}) VALUES ${placeholders}${returning}`,
      params,
    );

    return {
      data: this.returningColumns ? normalizeRows(result.rows, this.singleResult) as T | T[] | null : null,
      error: null,
      count: result.rowCount,
    };
  }

  private async executeUpdate(): Promise<QueryResponse<T | T[]>> {
    if (!this.values || Array.isArray(this.values)) {
      throw new Error('Update values must be an object.');
    }

    const params: QueryValue[] = [];
    const assignments = Object.entries(this.values)
      .map(([column, value]) => {
        params.push(value);
        return `${quoteIdentifier(column)} = $${params.length}`;
      })
      .join(', ');
    const whereClause = this.buildWhereClause(params);
    const returning = this.returningColumns ? ` RETURNING ${this.returningColumns}` : '';
    const result = await query<T>(
      `UPDATE ${quoteIdentifier(this.table)} SET ${assignments}${whereClause}${returning}`,
      params,
    );

    return {
      data: this.returningColumns ? normalizeRows(result.rows, this.singleResult) as T | T[] | null : null,
      error: null,
      count: result.rowCount,
    };
  }

  private async executeDelete(): Promise<QueryResponse<T | T[]>> {
    const params: QueryValue[] = [];
    const whereClause = this.buildWhereClause(params);
    const returning = this.returningColumns ? ` RETURNING ${this.returningColumns}` : '';
    const result = await query<T>(
      `DELETE FROM ${quoteIdentifier(this.table)}${whereClause}${returning}`,
      params,
    );

    return {
      data: this.returningColumns ? normalizeRows(result.rows, this.singleResult) as T | T[] | null : null,
      error: null,
      count: result.rowCount,
    };
  }

  private async executeUpsert(): Promise<QueryResponse<T | T[]>> {
    const rows = Array.isArray(this.values) ? this.values : [this.values];

    if (!rows.length || !rows[0]) {
      throw new Error('Upsert values cannot be empty.');
    }

    const params: QueryValue[] = [];
    const { columns, placeholders, columnNames } = this.buildValues(rows as Record<string, QueryValue>[], params);
    const conflicts = (this.upsertOptions.onConflict || 'id')
      .split(',')
      .map((column) => quoteIdentifier(column.trim()))
      .join(', ');
    const conflictColumns = new Set((this.upsertOptions.onConflict || 'id').split(',').map((column) => column.trim()));
    const updates = columnNames
      .filter((column) => !conflictColumns.has(column))
      .map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`)
      .join(', ');
    const conflictAction = this.upsertOptions.ignoreDuplicates || !updates
      ? 'DO NOTHING'
      : `DO UPDATE SET ${updates}`;
    const returning = this.returningColumns ? ` RETURNING ${this.returningColumns}` : '';
    const result = await query<T>(
      `INSERT INTO ${quoteIdentifier(this.table)} (${columns}) VALUES ${placeholders} ON CONFLICT (${conflicts}) ${conflictAction}${returning}`,
      params,
    );

    return {
      data: this.returningColumns ? normalizeRows(result.rows, this.singleResult) as T | T[] | null : null,
      error: null,
      count: result.rowCount,
    };
  }

  private buildValues(rows: Record<string, QueryValue>[], params: QueryValue[]): { columns: string; placeholders: string; columnNames: string[] } {
    const columnNames = Object.keys(rows[0]);
    const columns = columnNames.map(quoteIdentifier).join(', ');
    const placeholders = rows
      .map((row) => {
        const rowPlaceholders = columnNames.map((column) => {
          params.push(row[column]);
          return `$${params.length}`;
        });

        return `(${rowPlaceholders.join(', ')})`;
      })
      .join(', ');

    return { columns, placeholders, columnNames };
  }

  private buildWhereClause(params: QueryValue[]): string {
    if (!this.filters.length) {
      return '';
    }

    const clauses = this.filters.map((filter) => {
      const column = quoteIdentifier(filter.column);

      if (filter.operator === 'IS' || filter.operator === 'IS NOT') {
        if (filter.value !== null && typeof filter.value !== 'boolean') {
          throw new Error(`${filter.operator} only supports null or boolean values.`);
        }

        return `${column} ${filter.operator} ${filter.value === null ? 'NULL' : filter.value}`;
      }

      if (filter.operator === 'IN') {
        const values = Array.isArray(filter.value) ? filter.value : [];
        if (!values.length) {
          return 'FALSE';
        }

        const placeholders = values.map((value) => {
          params.push(value as QueryValue);
          return `$${params.length}`;
        });

        return `${column} IN (${placeholders.join(', ')})`;
      }

      params.push(filter.value);
      const placeholder = `$${params.length}`;
      if (filter.operator === '@>') {
        return `${column} @> ${placeholder}::jsonb`;
      }

      return `${column} ${filter.operator} ${placeholder}`;
    });

    return ` WHERE ${clauses.join(' AND ')}`;
  }

  private buildOrderClause(): string {
    if (!this.orders.length) {
      return '';
    }

    const orders = this.orders
      .map((order) => `${quoteIdentifier(order.column)} ${order.ascending ? 'ASC' : 'DESC'}`)
      .join(', ');

    return ` ORDER BY ${orders}`;
  }

  private buildPaginationClause(params: QueryValue[]): string {
    const clauses: string[] = [];

    if (this.limitValue !== null) {
      params.push(this.limitValue);
      clauses.push(`LIMIT $${params.length}`);
    }

    if (this.offsetValue !== null) {
      params.push(this.offsetValue);
      clauses.push(`OFFSET $${params.length}`);
    }

    return clauses.length ? ` ${clauses.join(' ')}` : '';
  }
}

class PgQueryClient {
  from<T extends QueryResultRow = any>(table: string): PgQueryBuilder<T> {
    return new PgQueryBuilder<T>(table);
  }

  async rpc<T extends QueryResultRow = any>(name: string, params: Record<string, QueryValue> = {}): Promise<QueryResponse<T>> {
    try {
      if (name === 'exec_sql') {
        const sql = params.query;
        if (typeof sql !== 'string') {
          throw new Error('exec_sql requires a string query parameter.');
        }

        await query(sql);
        return { data: null, error: null };
      }

      if (name === 'increment_divination_count') {
        const userId = params.user_id;
        if (typeof userId !== 'string') {
          throw new Error('increment_divination_count requires user_id.');
        }

        const result = await query<T>(
          'UPDATE user_levels SET divination_count = COALESCE(divination_count, 0) + 1, updated_at = NOW() WHERE user_id = $1 RETURNING *',
          [userId],
        );

        return { data: (result.rows[0] ?? null) as T | null, error: null, count: result.rowCount };
      }

      throw new Error(`Unsupported RPC function: ${name}`);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        count: null,
      };
    }
  }
}

function getPgClient(): PgQueryClient {
  getPostgresPool();
  return new PgQueryClient();
}

export type { QueryResponse };
export { getConnectionString, getPostgresPool, getPgClient, query, withTransaction };

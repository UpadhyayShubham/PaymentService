import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

export type DbClient = Pool | PoolClient;

export async function query<T extends QueryResultRow>(
  client: DbClient,
  text: string,
  values?: unknown[]
): Promise<QueryResult<T>> {
  return client.query<T>(text, values);
}

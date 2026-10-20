import { Pool, PoolClient } from "pg";

import { Account } from "../models/account.js"
import { AccountRepository } from "./account-repository";
import { InsufficientFundsError } from "../errors/payment-errors.js";

export class PostgresAccountRepository implements AccountRepository {
    constructor(
      private readonly client: Pool | PoolClient
    ) {}

    async findById(id: string): Promise<Account | null> {
      const result = await this.client.query(
        `
          SELECT
            id,
            employee_id,
            balance,
            created_at
          FROM accounts
          WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toAccount(result.rows[0]);
    }

    async findByEmployeeIdForUpdate(employeeId: string): Promise<Account | null> {
      const result = await this.client.query(
      `
          SELECT
          id,
          employee_id,
          balance,
          created_at
          FROM accounts
          WHERE employee_id = $1
          FOR UPDATE
      `,
        [employeeId]
      );

      if (result.rows.length === 0) {
          return null;
      }

      return this.toAccount(result.rows[0]);
    }

    async debit(id: string, amount: bigint): Promise<void> {
      const result = await this.client.query(
        `
          UPDATE accounts
          SET balance = balance - $1
          WHERE id = $2
            AND balance >= $1
        `,
        [amount.toString(), id]
      );

      if (result.rowCount != 1) {
        throw new InsufficientFundsError();
      }
    }

    private toAccount(row: any): Account {
      return {
          id: row.id,
          employeeId: row.employee_id,
          balance: BigInt(row.balance),
          createdAt: row.created_at,
      };
    }
}

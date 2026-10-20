import {
  describe,
  expect,
  it,
} from "vitest";

import { pool } from "../../src/db/pool.js";
import { withTransaction } from "../../src/db/transaction.js";

describe("database transactions", () => {
    it("rolls back all changes when an operation fails", async () => {
        const employeeResult = await pool.query(`
            INSERT INTO employees (name, email)
            VALUES ('Transaction Test', 'transaction-${Date.now()}@test.com')
            RETURNING id
        `);

        const employeeId = employeeResult.rows[0].id;

        const accountResult = await pool.query(
        `
            INSERT INTO accounts (employee_id, balance)
            VALUES ($1, 100000)
            RETURNING id
        `,
        [employeeId]
        );

        const accountId = accountResult.rows[0].id;

        await expect(
        withTransaction(pool, async (client) => {
            await client.query(
            `
                UPDATE accounts
                SET balance = balance - 25000
                WHERE id = $1
            `,
            [accountId]
            );

            throw new Error("Intentional failure");
        })
        ).rejects.toThrow("Intentional failure");

        const result = await pool.query(
        `
            SELECT balance
            FROM accounts
            WHERE id = $1
        `,
        [accountId]
        );

        expect(result.rows[0].balance).toBe("100000");
    });
});

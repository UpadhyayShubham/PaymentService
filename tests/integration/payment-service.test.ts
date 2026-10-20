import {
    afterAll,
    describe,
    expect,
    it,
} from "vitest";

import { pool } from "../../src/db/pool.js";
import { PostgresPaymentUnitOfWork } from "../../src/services/postgres-payment-unit-of-work.js";
import { PaymentService } from "../../src/services/payment-service.js";

describe("PaymentService integration", () => {
    afterAll(async () => {
        await pool.end();
    })

    it("pays a job atomically", async() => {
        const employee = await pool.query(
            `
                INSERT INTO employees (
                    name,
                    email
                ) VALUES (
                    'Integration Tests',
                    'integration-${Date.now()}@test.com' 
                )
                RETURNING id
        `);

        const employeeId = employee.rows[0].id;

        const account = await pool.query(
            `
                INSERT INTO accounts (
                    employee_id,
                    balance
                )
                VALUES ($1, 100000)
                RETURNING id
            `,
            [employeeId]
        );    

        const accountId = account.rows[0].id;

        const job = await pool.query(
        `
            INSERT INTO jobs (
            employee_id,
            description,
            amount
            )
            VALUES (
            $1,
            'Integration test job',
            25000
            )
            RETURNING id
        `,
        [employeeId]
        );

        const jobId = job.rows[0].id;

        const unitOfWork = new PostgresPaymentUnitOfWork(pool);

        const service = new PaymentService(unitOfWork);

        const payment = await service.payJob(jobId);

        expect(payment.jobId).toBe(jobId);
        expect(payment.accountId).toBe(accountId);
        expect(payment.amount).toBe(25000n);

        const balance = await pool.query(
        `
            SELECT balance
            FROM accounts
            WHERE id = $1
        `,
        [accountId]
        );

        expect(balance.rows[0].balance).toBe("75000");

        const updatedJob = await pool.query(
        `
            SELECT status
            FROM jobs
            WHERE id = $1
        `,
        [jobId]
        );

        expect(updatedJob.rows[0].status).toBe("paid");
    })

    it("allows only one concurrent payment for the same job", async () => {
        const employee = await pool.query(
            `
                INSERT INTO employees (
                    name,
                    email
                ) VALUES (
                    'Integration Tests',
                    'concurrent-${Date.now()}@test.com'
                )
                RETURNING id
        `);

        const employeeId = employee.rows[0].id;

        const account = await pool.query(
            `
                INSERT INTO accounts (
                    employee_id,
                    balance
                )
                VALUES ($1, 100000)
                RETURNING id
            `,
            [employeeId]
        );

        const accountId = account.rows[0].id;

        const job = await pool.query(
        `
            INSERT INTO jobs (
            employee_id,
            description,
            amount
            )
            VALUES (
            $1,
            'Concurrent integration test job',
            25000
            )
            RETURNING id
        `,
        [employeeId]
        );

        const jobId = job.rows[0].id;

        const unitOfWork = new PostgresPaymentUnitOfWork(pool);
        const service = new PaymentService(unitOfWork);

        const results = await Promise.allSettled([
            service.payJob(jobId),
            service.payJob(jobId),
        ]);

        const successful = results.filter(
            (result) => result.status === "fulfilled"
        );

        const failed = results.filter(
            (result) => result.status === "rejected"
        );

        expect(successful).toHaveLength(1);
        expect(failed).toHaveLength(1);

        const payments = await pool.query(
            `
            SELECT id, amount
            FROM payments
            WHERE job_id = $1
            `,
            [jobId]
        );

        expect(payments.rows).toHaveLength(1);
        expect(payments.rows[0].amount).toBe("25000");

        const balance = await pool.query(
            `
            SELECT balance
            FROM accounts
            WHERE id = $1
            `,
            [accountId]
        );

        expect(balance.rows[0].balance).toBe("75000");
        });
})
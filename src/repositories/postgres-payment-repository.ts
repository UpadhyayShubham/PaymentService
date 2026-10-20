import { Pool, PoolClient } from "pg";

import {
    Payment,
    PaymentStatus,
} from "../models/payment.js";

import { PaymentRepository } from "./payment-repository";

export class PostgresPaymentRepository implements PaymentRepository {
    constructor(
        private readonly client: Pool | PoolClient
    ){}

    async create(jobId: string, accountId: string, amount: bigint): Promise<Payment> {
        const result = await this.client.query(
            `
                INSERT INTO payments (
                    job_id,
                    account_id,
                    amount,
                    status
                )
                VALUES($1, $2, $3, 'completed')
                RETURNING
                    id,
                    job_id,
                    account_id,
                    amount,
                    status,
                    created_at
            `,
            [jobId, accountId, amount.toString()]
        );

        return this.toPayment(result.rows[0]);
    }

    async findByJobId(jobId: string): Promise<Payment | null> {
        const result = await this.client.query(
            `
                SELECT
                    id,
                    job_id,
                    account_id,
                    amount,
                    status,
                    created_at
                FROM payments
                WHERE job_id = $1;
            `,
            [jobId]
        );

        if (result.rows.length == 0) {
            return null;
        }

        return this.toPayment(result.rows[0]);
    }

    private toPayment(row: any): Payment {
        return {
            id: row.id,
            jobId: row.job_id,
            accountId: row.account_id,
            amount: BigInt(row.amount),
            status: row.status as PaymentStatus,
            createdAt: row.created_at,
        }
    }
}
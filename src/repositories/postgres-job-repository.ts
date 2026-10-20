import { Pool, PoolClient } from "pg";

import { Job, JobStatus } from "../models/job.js";
import { JobRepository } from "./job-repository";

export class PostgresJobRepository implements JobRepository {
    constructor(
        private readonly client: Pool | PoolClient
    ) {}

    async findById(id: string): Promise<Job | null> {
        const result = await this.client.query(
            `
            SELECT
                id,
                employee_id,
                description,
                amount,
                status,
                created_at
            FROM jobs
            WHERE id = $1
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return null;
        }

        return this.toJob(result.rows[0])
    }

    async markAsPaid(id: string): Promise<void> {
        await this.client.query(
            `
                UPDATE jobs
                SET status = 'paid'
                WHERE id = $1
            `,
            [id]
        );
    }

    private toJob(row: any): Job {
        return {
            id: row.id,
            employeeId: row.employee_id,
            description: row.description,
            amount: BigInt(row.amount),
            status: row.status as JobStatus,
            createdAt: row.created_at,
        }
    }
}
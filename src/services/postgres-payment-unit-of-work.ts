import { Pool } from "pg";

import { withTransaction } from "../db/transaction.js";

import { PostgresAccountRepository } from "../repositories/postgres-account-repository.js";
import { PostgresJobRepository } from "../repositories/postgres-job-repository.js";
import { PostgresPaymentRepository } from "../repositories/postgres-payment-repository.js";

import { PaymentUnitOfWork } from "../services/payment-unit-of-work.js";

export class PostgresPaymentUnitOfWork implements PaymentUnitOfWork { 
    constructor(private readonly pool: Pool) {}

    async run<T>(
        work: (repositories: {
            jobs: PostgresJobRepository;
            accounts: PostgresAccountRepository;
            payments: PostgresPaymentRepository;
        }) => Promise<T>
    ): Promise<T> {
        return withTransaction(this.pool, async (client) => {
            const repositories = {
                jobs: new PostgresJobRepository(client),
                accounts: new PostgresAccountRepository(client),
                payments: new PostgresPaymentRepository(client),
            };

            return work(repositories);
        })
    }
}

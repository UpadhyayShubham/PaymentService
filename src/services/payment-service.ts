import { Payment } from "../models/payment.js";

import { PaymentUnitOfWork } from "./payment-unit-of-work.js";

import {
  AccountNotFoundError,
  InsufficientFundsError,
  JobNotFoundError,
  JobNotPayableError,
} from "../errors/payment-errors.js";

export class PaymentService {
  constructor(
    private readonly unitOfWork: PaymentUnitOfWork
  ) {}

  async payJob(jobId: string): Promise<Payment> {
    return this.unitOfWork.run(
      async ({ jobs, accounts, payments }) => {
        // 1. Find the job
        const job = await jobs.findById(jobId);

        if (!job) {
          throw new JobNotFoundError();
        }

        // 2. Make sure the job can be paid
        if (job.status !== "pending") {
          throw new JobNotPayableError();
        }

        // 3. Find and lock the employee's account
        //
        // SELECT ... FOR UPDATE
        //
        // This prevents concurrent payment requests
        // from modifying the same account simultaneously.
        const account =
          await accounts.findByEmployeeIdForUpdate(
            job.employeeId
          );

        if (!account) {
          throw new AccountNotFoundError();
        }

        // 4. Create the payment
        //
        // The payment amount comes from the job.
        // We intentionally don't accept an amount from the API.
        const payment = await payments.create(
          job.id,
          account.id,
          job.amount
        );

        // 5. Debit the account
        //
        // The repository performs:
        //
        // UPDATE accounts
        // SET balance = balance - $1
        // WHERE id = $2
        //   AND balance >= $1
        //
        // If there isn't enough balance, this throws.
        // The UnitOfWork will then ROLLBACK the entire transaction.
        await accounts.debit(
          account.id,
          job.amount
        );

        // 6. Mark the job as paid
        await jobs.markAsPaid(job.id);

        // 7. Return the newly created payment
        //
        // The UnitOfWork will COMMIT after this function
        // successfully returns.
        return payment;
      }
    );
  }
}

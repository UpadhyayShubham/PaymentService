import { Account } from "../../src/models/account.js";
import { Job } from "../../src/models/job.js";
import { Payment } from "../../src/models/payment.js";

import { AccountRepository } from "../../src/repositories/account-repository.js";
import { JobRepository } from "../../src/repositories/job-repository.js";
import { PaymentRepository } from "../../src/repositories/payment-repository.js";
import { InsufficientFundsError } from "../../src/errors/payment-errors.js";

export class FakeJobRepository implements JobRepository {
  constructor(
    private readonly jobs: Job[]
  ) {}

  async findById(id: string): Promise<Job | null> {
    return this.jobs.find(
      (job) => job.id === id
    ) ?? null;
  }

  async markAsPaid(id: string): Promise<void> {
    const job = this.jobs.find(
      (job) => job.id === id
    );

    if (job) {
      job.status = "paid";
    }
  }
}


export class FakeAccountRepository implements AccountRepository
{
  constructor(
    private readonly accounts: Account[]
  ) {}

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find(
      (account) => account.id === id
    ) ?? null;
  }

  async findByEmployeeIdForUpdate(
    employeeId: string
  ): Promise<Account | null> {
    return this.accounts.find(
      (account) => account.employeeId === employeeId
    ) ?? null;
  }

  async debit(
    id: string,
    amount: bigint
  ): Promise<void> {
    const account = this.accounts.find(
      (account) => account.id === id
    );

    if (!account) {
      throw new Error("Account not found");
    }

    if (account.balance < amount) {
      throw new InsufficientFundsError();
    }

    account.balance -= amount;
  }
}


export class FakePaymentRepository implements PaymentRepository
{
  public readonly payments: Payment[] = [];

  async create(
    jobId: string,
    accountId: string,
    amount: bigint
  ): Promise<Payment> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      jobId,
      accountId,
      amount,
      status: "pending",
      createdAt: new Date(),
    };

    this.payments.push(payment);

    return payment;
  }

  async findByJobId(
    jobId: string
  ): Promise<Payment | null> {
    return this.payments.find(
      (payment) => payment.jobId === jobId
    ) ?? null;
  }
}
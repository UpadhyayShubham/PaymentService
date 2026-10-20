import { AccountRepository } from "../repositories/account-repository.js";
import { JobRepository } from "../repositories/job-repository.js";
import { PaymentRepository } from "../repositories/payment-repository.js";

export interface PaymentRepositories {
  jobs: JobRepository;
  accounts: AccountRepository;
  payments: PaymentRepository;
}

export interface PaymentUnitOfWork {
  run<T>(work: (repositories: PaymentRepositories) => Promise<T>): Promise<T>;
}
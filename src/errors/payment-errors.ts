import { AppError } from "./app-error.js"

export class JobNotFoundError extends AppError {
    constructor() {
        super("Job not found", "JOB_NOT_FOUND");
    }
}

export class JobNotPayableError extends AppError {
  constructor() {
    super("Job cannot be paid", "JOB_NOT_PAYABLE");
  }
}

export class AccountNotFoundError extends AppError {
  constructor() {
    super("Account not found", "ACCOUNT_NOT_FOUND");
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super("Insufficient account balance", "INSUFFICIENT_FUNDS");
  }
}

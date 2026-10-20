import {
  PaymentRepositories,
  PaymentUnitOfWork,
} from "../../src/services/payment-unit-of-work.js";

export class FakePaymentUnitOfWork
  implements PaymentUnitOfWork
{
  constructor(
    private readonly repositories: PaymentRepositories
  ) {}

  async run<T>(
    work: (repositories: PaymentRepositories) => Promise<T>
  ): Promise<T> {
    return work(this.repositories);
  }
}
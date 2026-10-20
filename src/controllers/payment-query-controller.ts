import { Request, Response } from "express";

import { PostgresPaymentRepository } from "../repositories/postgres-payment-repository.js";
import { pool } from "../db/pool.js";

export class PaymentQueryController {
  private readonly repository =
    new PostgresPaymentRepository(pool);

  getByJob = async (
    req: Request <{ jobId: string}>,
    res: Response
  ): Promise<void> => {
    const payment =
      await this.repository.findByJobId(
        req.params.jobId
      );

    if (!payment) {
      res.status(404).json({
        error: "Payment not found",
      });
      return;
    }

    res.json({
      id: payment.id,
      jobId: payment.jobId,
      accountId: payment.accountId,
      amount: payment.amount.toString(),
      status: payment.status,
      createdAt: payment.createdAt,
    });
  };
}

import { Request, Response } from "express";

import { PostgresAccountRepository } from "../repositories/postgres-account-repository.js";
import { pool } from "../db/pool.js";

export class AccountController {
  private readonly repository = new PostgresAccountRepository(pool);

  getBalance = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    const account =
      await this.repository.findById(req.params.id);

    if (!account) {
      res.status(404).json({
        error: "Account not found",
      });
      return;
    }

    res.json({
      id: account.id,
      employeeId: account.employeeId,
      balance: account.balance.toString(),
    });
  };
}

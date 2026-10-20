import { Request, Response } from "express";

import { PaymentService } from "../services/payment-service.js";
import { AppError } from "../errors/app-error.js";

export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) {}

    payJob = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { jobId } = req.body;

            if (!jobId || typeof jobId !== "string") {
                res.status(400).json({
                    error: "jobId is required",
                });
                return;
            }

            const payment =
                await this.paymentService.payJob(jobId);

            res.status(201).json({
                id: payment.id,
                jobId: payment.jobId,
                accountId: payment.accountId,
                amount: payment.amount.toString(),
                status: payment.status,
                createdAt: payment.createdAt,
            });
        } catch (error) {
            if (error instanceof AppError) {
                const statusCode = this.getStatusCode(error.code);

                res.status(statusCode).json({
                error: error.code,
                message: error.message,
                });

                return;
            }

            console.error(error);

            res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            });
        }
    };

    private getStatusCode(code: string): number {
        switch (code) {
        case "JOB_NOT_FOUND":
        case "ACCOUNT_NOT_FOUND":
            return 404;

        case "JOB_NOT_PAYABLE":
        case "INSUFFICIENT_FUNDS":
            return 409;

        default:
            return 500;
        }
    }
}